import { IdType } from "./enums";
import { dateFormats } from "../constants/constant";

//
export interface GenerateId {
  type: IdType;
  options?: {
    name?: string;
  }
}



//
export type DateInput = Date | string | number | null | undefined;
export type DateFormatPattern = typeof dateFormats[keyof typeof dateFormats] | (string & {});

// Calculate previous period helper props
export interface CalculatePrevPeriodProps {
  startDate: Date;
  endDate: Date;
}

//
export interface DateRangeResult {
  start: Date;
  end: Date;
  days: number;
  duration: number;
  prevStart: Date;
  prevEnd: Date;
}

//
export interface DateRangeProps {
  startDate: Date | string,
  endDate: Date | string,
  timeZone?: string;
}

//
export interface FormatDateProps {
  date: DateInput;
  pattern?: DateFormatPattern;
  timeZone?: string;
}