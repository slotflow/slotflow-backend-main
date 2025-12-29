import app from './app';
import dotenv from 'dotenv';
import connectDB from './config/database/mongodb/mongodb.config';

import './infrastructure/cron-jobs/updateBookingsCron';
import './infrastructure/cron-jobs/updateSubscriptionStatusCron';

import { initKafka, googlePassportStrategy } from './infrastructure/container';

dotenv.config();

(async () => {
  try {
    await initKafka();
    googlePassportStrategy.register();
    await connectDB();

    const port = process.env.PORT || 4000;
    app.listen(port, () =>
      console.log(`Server running on http://localhost:${port}`)
    );
  } catch (err) {
    console.error("Startup failed", err);
    process.exit(1);
  }
})();
