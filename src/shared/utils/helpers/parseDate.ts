import { isValid, parseISO } from "date-fns";
import { dateOnlyRegex } from "../constants/regex";

export const parseDate = (input: string | number | Date): Date => {
  if (input instanceof Date) {
    if (!isValid(input)) {
      throw new Error("Invalid Date object provided.");
    }
    return input;
  }

  if (typeof input === "string") {
    const trimmed = input.trim();

    if (dateOnlyRegex.test(trimmed)) {
      const [yearStr, monthStr, dayStr] = trimmed.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr) - 1; // Months are 0-indexed in JS Date
      const day = Number(dayStr);

      const utcDate = new Date(0);
      utcDate.setUTCFullYear(year, month, day);
      utcDate.setUTCHours(0, 0, 0, 0);

      if (
        utcDate.getUTCFullYear() !== year ||
        utcDate.getUTCMonth() !== month ||
        utcDate.getUTCDate() !== day
      ) {
        throw new Error(`Invalid calendar date string: "${input}"`);
      }

      return utcDate;
    }

    const parsedISO = parseISO(trimmed);
    if (isValid(parsedISO)) {
      return parsedISO;
    }
  }

  const parsed = new Date(input);
  if (!isValid(parsed)) {
    throw new Error(`Invalid date input provided: ${String(input)}`);
  }

  return parsed;
};
