import dayjs from "dayjs";
import { log } from "../../shared/logger/logger";
import { BookingQueriesImpl } from "../queries/bookingQueries.impl";
import { IBookingQueries } from "../../application/queries/IBooking.queries";
import { UpdateBookingStatusCronUseCase } from "../../application/useCases/cronJob/updateBookingStatus.useCase";

const bookingQueries: IBookingQueries = new BookingQueriesImpl();
const updateBookingStatusCronUseCase = new UpdateBookingStatusCronUseCase(bookingQueries);

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
      console.log("[INTERVAL] Booking status updated successfully.");
    } else {
      console.log("[INTERVAL] No booking update made or failed. Will retry...");
    }
  } catch (error) {
    log.error("[INTERVAL ERROR in booking status update]:", error as Error);
  }
}, 1000 * 60 * 60);
