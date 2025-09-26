import cors from 'cors';
import express, { Application, Router } from 'express';
import { CatsController } from './controllers/cats.controller';
import { ImagesController } from './controllers/images.controller';
import { UsersController } from './controllers/users.controller';
import { errorHandler } from './middleware/error-handler';
import { CatsService } from './services/cats.service';
import { ImagesService } from './services/images.service';
import { UsersService } from './services/users.service';

export const createApp = (): Application => {
  const app = express();
  app.use(
    cors({
      origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );
  const router = Router();

  const catsService = new CatsService();
  const imagesService = new ImagesService();
  const usersService = new UsersService();

  new CatsController(catsService).register(router);
  new ImagesController(imagesService).register(router);
  new UsersController(usersService).register(router);

  app.use(express.json());
  app.use(router);
  app.use(errorHandler);

  return app;
};
