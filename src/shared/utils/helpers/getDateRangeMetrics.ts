import { DateRangeResult } from "../types/types";
import { differenceInCalendarDays, differenceInMilliseconds, subMilliseconds } from "date-fns";

export function getDateRangeMetrics(
  startDate: Date | string,
  endDate: Date | string
): DateRangeResult {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  const days = differenceInCalendarDays(end, start) + 1;

  const duration = differenceInMilliseconds(end, start);

  const prevStart = subMilliseconds(start, duration);
  const prevEnd = subMilliseconds(start, 1);

  return {
    start,
    end,
    days,
    duration,
    prevStart,
    prevEnd,
  };
}