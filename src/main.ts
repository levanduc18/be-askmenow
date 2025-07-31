import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from '@/app.module';
import { CONFIG_KEYS } from '@/common/constants/config-keys.const';
import { AppConfig } from '@/config/types/app-config.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Config webhook.
  app.use('/stripe/webhook', express.raw({ type: 'application/json' }));
  app.use('/stripe/webhook', (req: any, res, next: express.NextFunction) => {
    req.rawBody = req.body;
    next();
  });
  app.use(bodyParser.json());

  // Add validation pipe.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // automatically remove undeclared fields in DTO
      forbidNonWhitelisted: true, // throw error if there is undeclared field
      transform: true, // automatically transform to the declared type in DTO (eg: string -> number)
      transformOptions: {
        enableImplicitConversion: true, // allow implicit conversion
      },
      disableErrorMessages: false, // enable explicit errors (disable in production if you want security)
    }),
  );

  // Add cookie parser.
  app.use(cookieParser());

  // Listen app running on port.
  const appConfig: AppConfig = configService.get<AppConfig>(CONFIG_KEYS.APP, { infer: true });
  app.enableCors({
    origin: appConfig.webUrl,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Websocket
  app.useWebSocketAdapter(new IoAdapter(app));

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('AskMeNow API')
    .setDescription('API documentation for AskMeNow project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(appConfig.port);

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(`🚀 Application is running on port: ${appConfig.port}`);
}

void bootstrap();
