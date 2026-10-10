import { timeRegex } from "../constants/regex";

export function parseTimeToMinutes(timeStr: string): number | null {
  const match = timeStr.trim().match(timeRegex);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}
