import dayjs from "../config/dayjs";
import { FormattedDateTime } from "../types";

export const formatToISTDateTime = (input: string | number | Date): FormattedDateTime => {
  const ist = dayjs(input).tz("Asia/Kolkata");

  return {
    date: ist.format("YYYY-MM-DD"),
    time: ist.format("hh:mm A"),
  };
};
