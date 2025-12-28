import app from './app';
import dotenv from 'dotenv';

import './infrastructure/services/passportService.impl.ts';
import './infrastructure/cron-jobs/updateBookingsCron';
import './infrastructure/cron-jobs/updateSubscriptionStatusCron';

// import { kafkaConfig } from './config/env';
// import { KafkaService } from './infrastructure/lib/kafka';

import connectDB from './config/database/mongodb/mongodb.config';
import { GooglePassportStrategyImpl } from './infrastructure/passport/google.strategy.ts';

dotenv.config();

// const kafkaService = new KafkaService(kafkaConfig.clientId!, kafkaConfig.brokers);

// await kafkaService.connectAdmin();
// await kafkaService.createTopics([kafkaConfig.otpSendTopic]);
// await kafkaService.disconnectAdmin();
// await kafkaService.connectProducer();

// export const producer = kafkaService.getProducer();

new GooglePassportStrategyImpl().register();

const port = process.env.PORT || 4000;

connectDB();

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})