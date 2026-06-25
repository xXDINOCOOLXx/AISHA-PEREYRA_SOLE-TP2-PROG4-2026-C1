import express, { Request, Response } from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

const expressApp = express();
let nestInitialized = false;

async function initNest() {
  if (nestInitialized) {
    return;
  }

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const allowedOrigins = [
    'https://aisha-pereyra-sole-tp-2-prog-4-2026-gules.vercel.app',
    'https://aisha-pereyra-sole-tp-2-prog-4-2026.vercel.app',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS origin denied'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  await app.init();
  nestInitialized = true;
}

export default async function handler(req: Request, res: Response) {
  try {
    await initNest();
    expressApp(req, res);
  } catch (error) {
    console.error('Backend initialization failed', error);
    res.status(500).send('Backend initialization failed');
  }
}

if (!process.env.VERCEL) {
  initNest()
    .then(() => {
      const port = process.env.PORT || 3000;
      expressApp.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`Backend listening on port ${port}`);
      });
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to start backend locally', error);
    });
}
