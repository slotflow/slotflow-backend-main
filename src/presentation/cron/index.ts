import { UpdateBookingStatusCron } from "./updateBookingsStatus.cron";
import { UpdateSubscriptionStatusCron } from "./updateSubscriptionStatus.cron";
import { bookingQueries, subscriptionQueries } from "../../infrastructure/queries";
import { UpdateBookingStatusUseCase } from "../../application/useCases/cronJob/updateBookingStatus.useCase";
import { UpdateSubscriptionStatusUseCase } from "../../application/useCases/cronJob/updateSubscriptionStatus.useCase";

export const initCronJobs = (): void => {

  const updateBookingStatusUseCase = new UpdateBookingStatusUseCase(bookingQueries);

  const updateBookingStatusCron = new UpdateBookingStatusCron(updateBookingStatusUseCase, 1);

  updateBookingStatusCron.start();

  const updateSubscriptionStatusUseCase = new UpdateSubscriptionStatusUseCase(subscriptionQueries);

  const updateSubscriptionStatusCron = new UpdateSubscriptionStatusCron(updateSubscriptionStatusUseCase, 1);

  updateSubscriptionStatusCron.start();
  
};
