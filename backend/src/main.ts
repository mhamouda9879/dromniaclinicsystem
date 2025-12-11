import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`\n📡 API Endpoints:`);
  console.log(`   Health: http://localhost:${port}/telegram/health`);
  console.log(`   Test: http://localhost:${port}/telegram/test`);
  console.log(`   Bot Info: http://localhost:${port}/telegram/bot-info`);
  console.log(`   Webhook Info: http://localhost:${port}/telegram/webhook-info`);
  console.log(`\n💡 Run 'npm run test:telegram' to test your Telegram bot configuration\n`);
}

bootstrap();

