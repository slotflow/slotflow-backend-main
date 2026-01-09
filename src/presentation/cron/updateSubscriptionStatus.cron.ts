import dayjs from "dayjs";
import { log } from "../../shared/logger/logger";
import { UpdateSubscriptionStatusUseCase } from "../../application/useCases/cronJob/updateSubscriptionStatus.useCase";

export class UpdateSubscriptionStatusCron {

  private lastRunDate: string | null = null;
  private readonly intervalMs: number;

  constructor(
    private readonly updateSubscriptionStatusUseCase: UpdateSubscriptionStatusUseCase,
    intervalHours = 1
  ) {
    this.intervalMs = intervalHours * 60 * 60 * 1000;
  };

  start(): void {
    log.info("UpdateSubscriptionStatusCron started");

    setInterval(async () => {
      await this.run();
    }, this.intervalMs);
  };

  private async run(): Promise<void> {
    const today = dayjs().format("YYYY-MM-DD");

    if (this.lastRunDate === today) {
      log.info("[CRON] Subscription status already updated today. Skipping.");
      return;
    };

    log.info("[CRON] Running UpdateSubscriptionStatusCron");

    try {
      const result = await this.updateSubscriptionStatusUseCase.execute();

      if (result === true) {
        this.lastRunDate = today;
        log.info("[CRON] Subscription status updated successfully");
      } else {
        log.info("[CRON] No subscription updates. Will retry later.");
      };
    } catch (error) {
      log.error(
        "UpdateSubscriptionStatusCron failed",
        error as Error
      );
    };
  };
};
