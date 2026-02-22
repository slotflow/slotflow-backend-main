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

export const getDateAfterDays = (days: number): Date => {
  return dayjs().add(days, "day").toDate();
};

export const getDateAfterMonths = (months: number): Date => {
  return dayjs().add(months, "months").toDate();
}

export const getNumberOfMonths = (days: number): number => {
  return days/30;
};

export const getNumberOfTotalDays = (numberOfMonths: number): number => {
  return numberOfMonths * 30
}