import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ResultErrorsInterceptor } from './core/interceptors/result-errors.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ResultErrorsInterceptor());
  await app.listen(5000);
}

bootstrap();
