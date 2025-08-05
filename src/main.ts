// main.ts (Versión Corregida y Recomendada)

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://frontend2-1-six.vercel.app' // CORREGIDO: Sin la barra "/" al final
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // RECOMENDADO: Especificar los métodos permitidos
    credentials: true,
  }); // La estructura del objeto ahora es correcta con la coma implícita

  // MEJORA: Es buena práctica usar el puerto del entorno para despliegues
  await app.listen(process.env.PORT || 3000);
}
bootstrap();