import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //await app.listen(3000);
  const HOST = process.env.HOST || 'localhost';
  const PORT = process.env.PORT || '9000';

  app.enableCors();

  await app.listen(PORT, () => {
    console.log(`🚀 Nest server started: http://${HOST}:${PORT}`);
  });
}

bootstrap();
