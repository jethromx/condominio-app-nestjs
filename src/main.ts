import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { Logger, ValidationPipe } from '@nestjs/common';
import { APP_RUNNING } from './common/messages.const';

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

  await app.listen(process.env.PORT);
  logger.log(APP_RUNNING(process.env.PORT));
}
bootstrap();
