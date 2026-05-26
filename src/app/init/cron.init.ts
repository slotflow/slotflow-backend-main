import { updateBookingStatusCron, updateSubscriptionStatusCron } from "../../presentation/cron";

export const initCronJobs = (): void => {
  updateBookingStatusCron.start();
  updateSubscriptionStatusCron.start();
};

export const stopCronJobs = (): void => {
  updateBookingStatusCron.stop();
  updateSubscriptionStatusCron.stop();
};