import dayjs from "dayjs";
import { log } from "../../shared/logger/logger";
import { SubscriptionQueriesImpl } from "../queries/subscriptionQueries.impl";
import { ISubscriptionQueries } from "../../application/queries/ISubscription.queries";
import { UpdateSubscriptionStatusUseCase } from "../../application/useCases/cronJob/updateSubscriptionStatus.useCase";

const subscriptionQueries: ISubscriptionQueries = new SubscriptionQueriesImpl();
const updateSubscriptionStatusCronUseCase = new UpdateSubscriptionStatusUseCase(subscriptionQueries);

let lastSuccessfulRunDateForBookings: string | null = null;

setInterval(async () => {

  const today = dayjs().format("YYYY-MM-DD");
  if (lastSuccessfulRunDateForBookings === today) return;

  console.log("[INTERVAL] Running updateSubscriptionStatus...");
  try {
    const result = await updateSubscriptionStatusCronUseCase.execute();

    if (result === true) {
      lastSuccessfulRunDateForBookings = today;
      console.log("[INTERVAL] Subscriptions status updated successfully.");
    } else {
      console.log("[INTERVAL] No subscription status update made or failed. Will retry...");
    }
  } catch (error) {
    log.error("[INTERVAL ERROR in subscription status update]:", error as Error);
  }
}, 1000 * 60  * 60);
