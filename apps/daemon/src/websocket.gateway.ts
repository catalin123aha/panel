import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { AppConfig } from '@bot-hosting/types';
import { DaemonService } from './daemon.service';

export class WebSocketGateway {
  private io: SocketIOServer;
  private httpServer: any;
  private daemonService: DaemonService;
  private config: AppConfig;

  constructor(config: AppConfig, daemonService: DaemonService) {
    this.config = config;
    this.daemonService = daemonService;
    this.httpServer = createServer();
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: config.app.url,
        credentials: true,
      },
    });
  }

  async start() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('subscribe:console', async (data: { botId: string }) => {
        try {
          await this.streamConsoleOutput(data.botId, socket);
        } catch (error) {
          socket.emit('error', { message: 'Failed to stream console' });
        }
      });

      socket.on('console:input', async (data: { botId: string; input: string }) => {
        try {
          await this.sendConsoleInput(data.botId, data.input);
        } catch (error) {
          socket.emit('error', { message: 'Failed to send console input' });
        }
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    const port = parseInt(process.env.DAEMON_PORT || '4001');
    this.httpServer.listen(port, () => {
      console.log(`WebSocket server listening on port ${port}`);
    });
  }

  private async streamConsoleOutput(botId: string, socket: any) {
    // TODO: Get container ID from bot ID
    const containerId = botId; // This should be fetched from database

    try {
      await this.daemonService.streamLogs(containerId, (log) => {
        socket.emit('console:output', {
          botId,
          output: log,
          timestamp: new Date(),
        });
      });
    } catch (error) {
      console.error('Console streaming error:', error);
      socket.emit('error', { message: 'Failed to stream console' });
    }
  }

  private async sendConsoleInput(botId: string, input: string) {
    // TODO: Get container ID from bot ID
    const containerId = botId; // This should be fetched from database

    // TODO: Implement sending input to container
    // This would typically use docker exec with input attached
  }

  stop() {
    this.io.close();
    this.httpServer.close();
  }
}
