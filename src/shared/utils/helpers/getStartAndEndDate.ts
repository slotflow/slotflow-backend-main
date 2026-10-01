import { addDays } from "date-fns";
import { parseDate } from "./parseDate";
import { fromZonedTime } from "date-fns-tz";
import { defaultTimezone } from "../constants/constant";

export const getStartAndEndDate = (
    startDate: Date,
    endDate: Date,
    timeZone: string = defaultTimezone
): { startDate: Date; endDate: Date } => {
    const parsedStart = parseDate(startDate);
    const parsedEnd = parseDate(endDate);

    const startYMD = parsedStart.toISOString().slice(0, 10);
    const endYMD = parsedEnd.toISOString().slice(0, 10);

    const startUtc = fromZonedTime(`${startYMD}T00:00:00.000`, timeZone);
    const endNextDayUtc = addDays(fromZonedTime(`${endYMD}T00:00:00.000`, timeZone), 1);

    return {
        startDate: startUtc,
        endDate: endNextDayUtc,
    };
};