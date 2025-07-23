import dayjs from "dayjs";
import { BookingRepositoryImpl } from "../database/booking/booking.repository.impl";
import { UpdateBookingStatusCronUseCase } from "../../application/cron-job.use-case/updateBookingStatusCron.use-case";

const bookingRepositoryImpl = new BookingRepositoryImpl();
const updateBookingStatusCronUseCase = new UpdateBookingStatusCronUseCase(bookingRepositoryImpl);

let lastRunDate: string | null = null;

setInterval(async () => {
  const today = dayjs().format("YYYY-MM-DD");
  if (lastRunDate === today) {
    console.log("[INTERVAL] Already executed successfully today. Skipping...");
    return;
  }

  console.log("[INTERVAL] Running updateBookingStatus...");

  try {
    const result = await updateBookingStatusCronUseCase.execute();

    if (result === true) {
      lastRunDate = today;
      console.log("[INTERVAL] updateBookingStatus updated successfully.");
    } else {
      console.warn("[INTERVAL] updateBookingStatus did not update any records. Will retry...");
    }
  } catch (error) {
    console.error("[INTERVAL ERROR] updateBookingStatus failed:", error);
  }
}, 60 * 60 * 1000 * 24);
