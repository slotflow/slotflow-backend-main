import { parse } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export function parseZonedSlotToUtc(dateStr: string, timeStr: string, timeZone: string): Date {
  const dateTimeStr = `${dateStr} ${timeStr}`;
  const localDate = parse(dateTimeStr, "yyyy-MM-dd hh:mm a", new Date());
  const formattedIsoLocal = localDate.toISOString().slice(0, 19);
  return fromZonedTime(formattedIsoLocal, timeZone);
}
