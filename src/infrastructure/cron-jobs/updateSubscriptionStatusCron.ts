import dayjs from "dayjs";
import { SubscriptionRepositoryImpl } from "../database/subscription/subscription.repository.impl";
import { UpdateSubscriptionStatusUseCase } from "../../application/cron-job.use-case/updateSubscriptionStatusCron.use-case";

const subscriptionRepositoryImpl = new SubscriptionRepositoryImpl()
const updateSubscriptionStatusUseCase = new UpdateSubscriptionStatusUseCase(subscriptionRepositoryImpl);

let lastRunDate: string | null = null;

setInterval(async () => {
  const today = dayjs().format("YYYY-MM-DD");
  if (lastRunDate === today) {
    console.log("[INTERVAL] Already executed successfully today. Skipping...");
    return;
  }

  console.log("[INTERVAL] Running updateSubscriptionStatus...");

  try {
    const result = await updateSubscriptionStatusUseCase.execute();

    if (result === true) {
      lastRunDate = today;
      console.log("[INTERVAL] updateSubscriptionStatus executed successfully.");
    } else {
      console.warn("[INTERVAL] updateSubscriptionStatus did not update any records. Will retry later.");
    }
  } catch (error) {
    console.error("[INTERVAL ERROR] updateSubscriptionStatus failed:", error);
  }
}, 10 * 60 * 1000);
