import { parseDate } from "./parseDate";
import { endOfDay, startOfDay } from "date-fns";

export const getStartAndEndDate = (
    startDate: Date,
    endDate: Date
): { startDate: Date; endDate: Date } => {
    return {
        startDate: startOfDay(parseDate(startDate)),
        endDate: endOfDay(parseDate(endDate)),
    };
};