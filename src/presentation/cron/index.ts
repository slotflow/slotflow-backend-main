import { UpdateBookingStatusCron } from "./updateBookingsStatus.cron";
import { UpdateSubscriptionStatusCron } from "./updateSubscriptionStatus.cron";
import { bookingQueries, subscriptionQueries } from "../../infrastructure/queriesImpls";
import { UpdateBookingStatusUseCase } from "../../application/useCases/cronJob/updateBookingStatus.useCase";
import { UpdateSubscriptionStatusUseCase } from "../../application/useCases/cronJob/updateSubscriptionStatus.useCase";

export const updateBookingStatusUseCase = new UpdateBookingStatusUseCase(bookingQueries);

export const updateBookingStatusCron = new UpdateBookingStatusCron(updateBookingStatusUseCase, 1);

export const updateSubscriptionStatusUseCase = new UpdateSubscriptionStatusUseCase(subscriptionQueries);

export const updateSubscriptionStatusCron = new UpdateSubscriptionStatusCron(updateSubscriptionStatusUseCase, 1);