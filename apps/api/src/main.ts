import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module.js';
import { APP_CONFIG } from '@repo/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '15mb' }));
  app.use(urlencoded({ limit: '15mb', extended: true }));
  app.enableCors();
  app.setGlobalPrefix('api');
  const port = process.env.PORT ?? APP_CONFIG.defaultPort;
  await app.listen(port);
  console.log(`🚀 NestJS API running on: http://localhost:${port}/api`);
}
await bootstrap();
