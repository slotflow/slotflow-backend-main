import { parseDate } from "./parseDate";
import { dateOnlyRegex } from "../constants/regex";
import { defaultTimezone } from "../constants/constant";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { DateRangeProps, DateRangeResult } from "../types/types";

const toDateOnlyString = (input: Date | string, timeZone: string): string => {
  const trimmed = typeof input === "string" ? input.trim() : input;
  if (typeof trimmed === "string" && dateOnlyRegex.test(trimmed)) {
    parseDate(trimmed);
    return trimmed;
  }

  return formatInTimeZone(parseDate(trimmed), timeZone, "yyyy-MM-dd");
};

const shiftDateOnly = (dateString: string, days: number): string => {
  const date = parseDate(dateString);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

/**
 *
 * @param data * 1. INPUT PARAMS:
 *    - startDate: "2026-03-01"
 *    - endDate:   "2026-03-31"
 *    - timeZone:  "America/New_York"
 *
 * @return :
 *    - start:     2026-03-01T05:00:00.000Z (00:00:00.000 in NY)
 *    - end:       2026-04-01T03:59:59.999Z (23:59:59.999 in NY)
 *    - prevStart: 2026-01-29T05:00:00.000Z (31 days prior)
 *    - prevEnd:   2026-03-01T04:59:59.999Z (1ms before start)
 *    - days:      31
 *
 */

export function getDateRangeMetrics(data: DateRangeProps): DateRangeResult {
  const { startDate, endDate } = data;
  const timeZone = data.timeZone || defaultTimezone;

  const startDateString = toDateOnlyString(startDate, timeZone);
  const endDateString = toDateOnlyString(endDate, timeZone);

  if (startDateString > endDateString) {
    throw new Error("startDate cannot be after endDate.");
  }

  const start = fromZonedTime(`${startDateString}T00:00:00.000`, timeZone);

  const end = fromZonedTime(`${endDateString}T23:59:59.999`, timeZone);

  const durationInMs = end.getTime() - start.getTime() + 1;
  const days =
    (parseDate(endDateString).getTime() - parseDate(startDateString).getTime()) / 86_400_000 + 1;

  const prevStartDateString = shiftDateOnly(startDateString, -days);
  const prevEndDateString = shiftDateOnly(startDateString, -1);
  const prevStart = fromZonedTime(`${prevStartDateString}T00:00:00.000`, timeZone);
  const prevEnd = fromZonedTime(`${prevEndDateString}T23:59:59.999`, timeZone);

  return {
    start,
    end,
    days,
    duration: durationInMs,
    prevStart,
    prevEnd,
  };
}

export function getDayBoundaryMetrics(dateStr: string, timeZone?: string): DateRangeResult {
  return getDateRangeMetrics({
    startDate: dateStr,
    endDate: dateStr,
    timeZone,
  });
}
