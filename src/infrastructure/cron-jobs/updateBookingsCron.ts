import dayjs from "dayjs";
import { BookingRepositoryImpl } from "../database/booking/booking.repository.impl";
import { UpdateBookingStatusCronUseCase } from "../../application/useCases/cronJob/updateBookingStatus.useCase";

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
      console.log("[INTERVAL] Booking status updated successfully.");
    } else {
      console.log("[INTERVAL] No booking update made or failed. Will retry...");
    }
  } catch (error) {
    console.error("[INTERVAL ERROR in booking status update]:", error);
  }
}, 1000 * 60 * 60);
