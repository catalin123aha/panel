import Docker from 'dockerode';
import Redis from 'ioredis';
import { AppConfig } from '@bot-hosting/types';

export class DaemonService {
  private docker: Docker;
  private redis: Redis;
  private config: AppConfig;
  private statsInterval: NodeJS.Timeout | null = null;

  constructor(config: AppConfig) {
    this.config = config;
    this.docker = new Docker({ socketPath: config.docker.socketPath });
    this.redis = new Redis(config.redis.url);
  }

  async initialize() {
    await this.ensureNetwork();
    this.startStatsCollection();
  }

  private async ensureNetwork() {
    try {
      const networks = await this.docker.listNetworks();
      const exists = networks.some((n) => n.Name === this.config.docker.network);

      if (!exists) {
        await this.docker.createNetwork({
          Name: this.config.docker.network,
          Driver: 'bridge',
        });
        console.log(`Created Docker network: ${this.config.docker.network}`);
      }
    } catch (error) {
      console.error('Failed to ensure network:', error);
    }
  }

  async createContainer(botId: string, options: {
    name: string;
    runtime: string;
    port?: number;
    envData: Record<string, string>;
    cpuLimit: number;
    memoryLimit: number;
    diskLimit: number;
  }) {
    const imageName = this.getImageForRuntime(options.runtime);
    
    // Pull image
    await this.pullImage(imageName);

    // Create volume
    const volumeName = `bot_${botId}_files`;
    await this.docker.createVolume({ Name: volumeName });

    // Create container
    const containerConfig: any = {
      name: options.name,
      Image: imageName,
      Env: Object.entries(options.envData).map(([k, v]) => `${k}=${v}`),
      HostConfig: {
        Binds: [`${volumeName}:/home/bot`],
        PortBindings: options.port ? {
          '3000/tcp': [{ HostPort: options.port.toString() }],
        } : undefined,
        Memory: options.memoryLimit * 1024 * 1024, // Convert MB to bytes
        CpuQuota: options.cpuLimit * 100000, // Convert to CPU quota
        CpuPeriod: 100000,
        NetworkMode: this.config.docker.network,
      },
      NetworkingConfig: {
        EndpointsConfig: {
          [this.config.docker.network]: {},
        },
      },
    };

    const container = await this.docker.createContainer(containerConfig);
    await container.start();

    return container.id;
  }

  async startContainer(containerId: string) {
    const container = this.docker.getContainer(containerId);
    await container.start();
  }

  async stopContainer(containerId: string) {
    const container = this.docker.getContainer(containerId);
    await container.stop({ t: 10 });
  }

  async restartContainer(containerId: string) {
    const container = this.docker.getContainer(containerId);
    await container.restart({ t: 10 });
  }

  async killContainer(containerId: string) {
    const container = this.docker.getContainer(containerId);
    await container.kill();
  }

  async removeContainer(containerId: string, removeVolume: boolean = false) {
    const container = this.docker.getContainer(containerId);
    
    try {
      await container.stop({ t: 5 });
    } catch (error) {
      // Container might already be stopped
    }

    await container.remove({ force: true });

    if (removeVolume) {
      const volumeName = `bot_${containerId}_files`;
      const volume = this.docker.getVolume(volumeName);
      await volume.remove();
    }
  }

  async getContainerStats(containerId: string) {
    const container = this.docker.getContainer(containerId);
    const stats = await container.stats({ stream: false });

    return {
      cpuPercent: this.calculateCpuPercent(stats),
      memoryMb: this.calculateMemoryMb(stats),
      diskMb: 0, // TODO: Implement disk usage
      networkRxMb: this.calculateNetworkRxMb(stats),
      networkTxMb: this.calculateNetworkTxMb(stats),
    };
  }

  async getContainerLogs(containerId: string, tail: number = 100) {
    const container = this.docker.getContainer(containerId);
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail,
      timestamps: true,
    });

    return logs.toString('utf-8').split('\n').filter(Boolean);
  }

  async execInContainer(containerId: string, command: string[]) {
    const container = this.docker.getContainer(containerId);
    const exec = await container.exec({
      Cmd: command,
      AttachStdout: true,
      AttachStderr: true,
    });

    const stream = await exec.start({ Detach: false });
    return new Promise((resolve) => {
      let output = '';
      stream.on('data', (chunk: any) => {
        output += chunk.toString('utf-8');
      });
      stream.on('end', () => resolve(output));
    });
  }

  async readFile(containerId: string, path: string): Promise<string> {
    const output = await this.execInContainer(containerId, ['cat', path]);
    return output as string;
  }

  async writeFile(containerId: string, path: string, content: string): Promise<void> {
    const container = this.docker.getContainer(containerId);
    // TODO: Implement file writing using exec with echo or by creating a tar archive
  }

  async listFiles(containerId: string, path: string = '/home/bot'): Promise<any[]> {
    const output = await this.execInContainer(containerId, ['find', path, '-type', 'f', '-exec', 'ls', '-la', '{}', ';']);
    // Parse output and return file list
    return [];
  }

  async streamLogs(containerId: string, callback: (log: string) => void) {
    const container = this.docker.getContainer(containerId);
    const stream = await container.logs({
      stdout: true,
      stderr: true,
      follow: true,
      timestamps: true,
    });

    stream.on('data', (chunk: any) => {
      callback(chunk.toString('utf-8'));
    });
  }

  private startStatsCollection() {
    this.statsInterval = setInterval(async () => {
      try {
        const containers = await this.docker.listContainers();
        
        for (const containerInfo of containers) {
          if (containerInfo.Names.some((name) => name.startsWith('/bot-'))) {
            const stats = await this.getContainerStats(containerInfo.Id);
            
            // Publish to Redis
            await this.redis.publish(`bot:${containerInfo.Id}:stats`, JSON.stringify(stats));
            
            // Save to database (TODO: Implement)
          }
        }
      } catch (error) {
        console.error('Stats collection error:', error);
      }
    }, 5000); // Every 5 seconds
  }

  private async pullImage(imageName: string) {
    try {
      await new Promise<void>((resolve, reject) => {
        this.docker.pull(imageName, (err: Error, stream: any) => {
          if (err) {
            reject(err);
            return;
          }

          this.docker.modem.followProgress(stream, (err: any) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });
    } catch (error) {
      console.error(`Failed to pull image ${imageName}:`, error);
      throw error;
    }
  }

  private getImageForRuntime(runtime: string): string {
    const images: Record<string, string> = {
      'NODEJS': 'node:20-alpine',
      'PYTHON': 'python:3.12-slim',
      'JAVA': 'eclipse-temurin:21-jdk-alpine',
      'GO': 'golang:1.22-alpine',
      'RUST': 'rust:1.80-alpine',
    };

    return images[runtime] || 'node:20-alpine';
  }

  private calculateCpuPercent(stats: any): number {
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100;
    return Math.round(cpuPercent * 100) / 100;
  }

  private calculateMemoryMb(stats: any): number {
    const usage = stats.memory_stats.usage || 0;
    const limit = stats.memory_stats.limit || 1;
    return Math.round((usage / 1024 / 1024) * 100) / 100;
  }

  private calculateNetworkMb(stats: any, type: 'rx' | 'tx'): number {
    const network = stats.networks || {};
    let total = 0;
    
    Object.values(network).forEach((iface: any) => {
      total += type === 'rx' ? iface.rx_bytes : iface.tx_bytes;
    });

    return Math.round((total / 1024 / 1024) * 100) / 100;
  }

  private calculateNetworkRxMb(stats: any): number {
    return this.calculateNetworkMb(stats, 'rx');
  }

  private calculateNetworkTxMb(stats: any): number {
    return this.calculateNetworkMb(stats, 'tx');
  }

  async shutdown() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
    await this.redis.quit();
  }
}
