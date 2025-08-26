import dayjs from "dayjs";
import { SubscriptionRepositoryImpl } from "../database/subscription/subscription.repository.impl";
import { UpdateSubscriptionStatusCronUseCase } from "../../application/cron-job.use-case/updateSubscriptionStatusCron.use-case";

const subscriptionRepositoryImpl = new SubscriptionRepositoryImpl();
const updateSubscriptionStatusCronUseCase = new UpdateSubscriptionStatusCronUseCase(subscriptionRepositoryImpl);

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
    console.error("[INTERVAL ERROR in subscription status update]:", error);
  }
}, 10 * 60 * 1000);
