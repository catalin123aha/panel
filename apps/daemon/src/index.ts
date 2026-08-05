import { loadConfig } from '@bot-hosting/config';
import { DaemonService } from './daemon.service';
import { WebSocketGateway } from './websocket.gateway';

async function bootstrap() {
  const config = loadConfig();

  const daemonService = new DaemonService(config);
  const wsGateway = new WebSocketGateway(config, daemonService);

  await daemonService.initialize();
  await wsGateway.start();

  console.log('🚀 Daemon service started');
}

bootstrap().catch((error) => {
  console.error('Failed to start daemon:', error);
  process.exit(1);
});
