import app from './app/app';
import { appConfig } from './config/env';
import { initDB } from './app/init/db.init';
import { log } from './shared/logger/logger';
import { initOtel } from './app/init/otel.init';
import { initKafka } from './app/init/kafka.init';
import { initCronJobs } from './app/init/cron.init';
import { printText } from './shared/utils/printText';
import { initPassport } from './app/init/passport.init';
import { setupGracefulShutdown } from './app/init/shutdown';

const start = async () => {
  try {

    // await initOtel();
    await initDB();
    initCronJobs();
    initPassport();
    await initKafka();

    const server = app.listen(appConfig.port, () => {
      printText();
      log.info(`Live on http://localhost:${appConfig.port}`)
    }
    );

    setupGracefulShutdown(server);

  } catch (error) {
    log.error("Startup failed", error as Error);
    process.exit(1);
  }
};

start();
