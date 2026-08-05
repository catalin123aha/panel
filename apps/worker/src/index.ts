import { loadConfig } from '@bot-hosting/config';
import { WorkerService } from './worker.service';

async function bootstrap() {
  const config = loadConfig();

  const workerService = new WorkerService(config);
  await workerService.initialize();

  console.log('🚀 Worker service started');
}

bootstrap().catch((error) => {
  console.error('Failed to start worker:', error);
  process.exit(1);
});
