import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200', // permite Angular
    credentials: true, // si usas cookies o headers personalizados
  });
  

  await app.listen(3000);
}
bootstrap();

