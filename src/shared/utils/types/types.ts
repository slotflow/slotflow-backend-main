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
export interface DateRangeResult {
  start: Date;
  end: Date;
  days: number;
  duration: number;
  prevStart: Date;
  prevEnd: Date;
}

//
export type DateInput = Date | string | number | null | undefined;
export type DateFormatPattern = typeof dateFormats[keyof typeof dateFormats] | (string & {});