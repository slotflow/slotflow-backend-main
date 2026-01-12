import dayjs from "../config/dayjs";
import { FormattedDateTime } from "./types";

export const formatUtcDateTime = (input: string | number | Date): FormattedDateTime => {
  const utc = dayjs.utc(input);

  return {
    date: utc.format("YYYY-MM-DD"),
    time: utc.format("HH:mm A"),
  };
};

export const getUtcDateRange = (startDate: string | number | Date, endDate: string | number | Date): { startDate: string; endDate: string } => {
  const start = dayjs.utc(startDate);
  const end = dayjs.utc(endDate);

  return {
    startDate: start.format("YYYY-MM-DD"),
    endDate: end.format("YYYY-MM-DD"),
  };
};

export const isSubscriptionExpired = (endDate: string | Date): boolean => {
  return dayjs().isAfter(dayjs(endDate), "day");
};

export const getDateAfterDays = (days: number,fromDate: string | number | Date = new Date()): Date => {
  return dayjs(fromDate).add(days, "day").toDate();
};