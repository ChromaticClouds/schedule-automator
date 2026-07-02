import { buildApp } from './app.js';
import { ENV } from './config/env.js';
import { connectMongo, disconnectMongo } from './db/connection.js';

(async () => {
  await connectMongo();
  const app = await buildApp();

  const shutdown = async (signal: NodeJS.Signals) => {
    app.log.info({ signal }, 'shutting down server');
    await app.close();
    await disconnectMongo();
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  try {
    await app.listen({
      port: ENV.PORT,
      host: '0.0.0.0',
    });
  } catch (error) {
    app.log.error(error);
    await disconnectMongo();
    process.exit(1);
  }
})();
