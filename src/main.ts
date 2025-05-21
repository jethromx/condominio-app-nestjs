import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { Logger, ValidationPipe } from '@nestjs/common';
import { APP_RUNNING } from './common/messages.const';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });


  const logger = new Logger('Bottstrap');
  
  // Set the global prefix for all routes
  app.setGlobalPrefix('api/v1');

  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Habilitar CORS
  app.enableCors({
    origin: process.env.HOST_FRONT, // Permitir solicitudes desde este origen
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    credentials: true, // Permitir cookies y encabezados de autenticación
  });

  // Habilitar Helmet
  app.use(helmet());

  await app.listen(process.env.PORT);
  logger.log(APP_RUNNING(process.env.PORT));
}
bootstrap();
