import dayjs from "dayjs";
import { log } from "../../shared/logger/logger";
import { UpdateBookingStatusUseCase } from "../../application/useCases/cronJob/updateBookingStatus.useCase";

export class UpdateBookingStatusCron {
    
  private lastRunDate: string | null = null;
  private readonly intervalMs: number;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    private readonly updateBookingStatusUseCase: UpdateBookingStatusUseCase,
    intervalHours = 1
  ) {
    this.intervalMs = intervalHours * 60 * 60 * 1000;
  };

  start(): void {
    log.info("UpdateBookingStatusCron started");

    this.intervalId = setInterval(async () => {
      await this.run();
    }, this.intervalMs);
  };

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    log.info("UpdateBookingStatusCron stopped");
  }

  private async run(): Promise<void> {
    const today = dayjs().format("YYYY-MM-DD");

    if (this.lastRunDate === today) {
      log.info("[CRON] Booking status already updated today. Skipping.");
      return;
    };

    log.info("[CRON] Running UpdateBookingStatusCron");

    try {
      const result = await this.updateBookingStatusUseCase.execute();

      if (result === true) {
        this.lastRunDate = today;
        log.info("[CRON] Booking status updated successfully");
      } else {
        log.info("[CRON] No updates performed. Will retry later");
      };
    } catch (error) {
      log.error("UpdateBookingStatusCron failed", error as Error);
    };
  };
};