import 'reflect-metadata';
import { createApp } from './app';
import { appConfig } from './config/environment';
import { connectDatabase, disconnectDatabase } from './database';

const bootstrap = async () => {
  try {
    await connectDatabase(appConfig.database.uri);
    const app = createApp();
    const server = app.listen(appConfig.port, () => {
      console.log(`Server listening on port ${appConfig.port}`);
    });

    let isShuttingDown = false;

    const shutdown = async () => {
      if (isShuttingDown) {
        return;
      }

      isShuttingDown = true;

      server.close(async (closeError?: Error) => {
        if (closeError) {
          console.error('Error shutting down HTTP server', closeError);
        }

        try {
          await disconnectDatabase();
        } finally {
          process.exit(closeError ? 1 : 0);
        }
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start application', error);
    process.exit(1);
  }
};

bootstrap();
