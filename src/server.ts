import app from './app';
import dotenv from 'dotenv';

import './infrastructure/services/passport';
import './infrastructure/cron-jobs/updateBookingsCron';
import './infrastructure/cron-jobs/updateSubscriptionStatusCron';

// import { kafkaConfig } from './config/env';
// import { KafkaService } from './infrastructure/lib/kafka';

import connectDB from './config/database/mongodb/mongodb.config';

dotenv.config();

// const kafkaService = new KafkaService(kafkaConfig.clientId!, kafkaConfig.brokers);

// await kafkaService.connectAdmin();
// await kafkaService.createTopics([kafkaConfig.otpSendTopic]);
// await kafkaService.disconnectAdmin();
// await kafkaService.connectProducer();

// export const producer = kafkaService.getProducer();

const port = process.env.PORT || 3000;

connectDB();

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})