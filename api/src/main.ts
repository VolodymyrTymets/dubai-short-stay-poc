// IMPORTANT: Make sure to import `instrument.ts` at the top of your file.
// If you're using CommonJS (CJS) syntax, use `require("./instrument.ts");`
import './instrument';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: ['http://localhost:3000', 'http://localhost:3002'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
