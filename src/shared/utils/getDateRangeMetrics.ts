import dayjs from "dayjs";
import { DateRangeResult } from "./types";

export function getDateRangeMetrics(
  startDate: Date | string,
  endDate: Date | string
): DateRangeResult {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  const days = end.diff(start, "day") + 1;

  const duration = end.diff(start, "millisecond");

  const prevStart = start.subtract(duration, "millisecond");
  const prevEnd = start.subtract(1, "millisecond");

  return {
    start,
    end,
    days,
    duration,
    prevStart,
    prevEnd,
  };
}