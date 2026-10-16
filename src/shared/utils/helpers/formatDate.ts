import { isValid } from "date-fns";
import { parseDate } from "./parseDate";
import { formatInTimeZone } from "date-fns-tz";
import { FormatDateProps } from "../types/types";
import { dateFormats, defaultTimezone } from "../constants/constant";

/**
 * Formats a date string, number, or Date instance into a specific pattern
 * aligned with a target timezone.
 *
 */

export const formatDate = (data: FormatDateProps): string => {
  const { date, pattern = dateFormats.SHORT, timeZone = defaultTimezone ?? "Asia/Kolkata" } = data;

  if (!date) return "N/A";

  try {
    const parsedDate = parseDate(date);

    if (!isValid(parsedDate)) {
      return "N/A";
    }

    return formatInTimeZone(parsedDate, timeZone, pattern);
  } catch {
    return "N/A";
  }
};
