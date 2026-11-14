import { RequestMethod, ValidationPipe, type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { json, urlencoded, type Express } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppConfigService } from './modules/config/app-config.service';
import { API_GLOBAL_PREFIX, JSON_BODY_LIMIT } from './modules/shared/constants';

/** Applies the HTTP settings shared by the server and the end-to-end tests. */
export function configureApp(app: INestApplication): void {
  const config = app.get(AppConfigService);
  app.useLogger(app.get(Logger));

  const expressApp = app.getHttpAdapter().getInstance() as Express;
  if (config.trustProxy) {
    expressApp.set('trust proxy', 1);
  }

  app.use(helmet());
  app.use(cookieParser());
  app.use(json({ limit: JSON_BODY_LIMIT }));
  app.use(urlencoded({ extended: true, limit: JSON_BODY_LIMIT }));
  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix(API_GLOBAL_PREFIX, {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  if (config.swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Boilerplate API')
      .setDescription('HTTP API for the boilerplate.')
      .setVersion('1.0.0')
      .addCookieAuth('access_token')
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));
  }
}
