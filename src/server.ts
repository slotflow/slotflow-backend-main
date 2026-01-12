import app from './app';
import { appConfig } from './config/env';
import { log } from './shared/logger/logger';
import { initCronJobs } from './presentation/cron';
import connectDB from './config/database/mongodb/mongodb.config';
import { googlePassportStrategy } from './infrastructure/passport';
import { kafkaConsumer, kafkaProducer } from './infrastructure/messaging';

const start = async () => {
  try {
    await connectDB();
    initCronJobs();
    googlePassportStrategy.register();
    await kafkaConsumer.connectConsumer();
    await kafkaProducer.connectProducer();

    app.listen(appConfig.port, () =>
      log.info(`Main Backend Service is running on http://localhost:${appConfig.port}`)
    );
  } catch (error) {
    log.error("Startup failed", error as Error);
    process.exit(1);
  }
};

start();
