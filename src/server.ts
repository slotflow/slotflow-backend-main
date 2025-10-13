import app from './app';
import dotenv from 'dotenv';

import './infrastructure/services/passport';
import './infrastructure/cron-jobs/updateBookingsCron';
import './infrastructure/cron-jobs/updateSubscriptionStatusCron';
import connectDB from './config/database/mongodb/mongodb.config';
import { connectKafkaProducer } from './infrastructure/lib/kafka.producer';

dotenv.config();

const port = process.env.PORT || 3000;

await connectKafkaProducer();

connectDB();

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})