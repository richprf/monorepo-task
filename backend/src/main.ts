import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
  });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`NestJS listening on http://127.0.0.1:${port}`);
}

await bootstrap();
