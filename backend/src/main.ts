import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { configureApp } from './configure-app';
import { AppModule } from './app.module';
import { AppConfigService } from './modules/config/app-config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  configureApp(app);
  const config = app.get(AppConfigService);
  await app.listen(config.port);
  app.get(Logger).log(`Listening on port ${config.port}`);
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'unknown error';
  process.stderr.write(`Bootstrap failed: ${message}\n`);
  process.exit(1);
});
