import {
  format,
  addDays,
  addMonths,
  isAfter,
  startOfDay,
  endOfDay,
  isValid,
} from 'date-fns';
import { dateFormats } from '../constants/constant';
import { DateFormatPattern, DateInput } from '../types/types';


const parseDate = (input: string | number | Date): Date => {
  const parsed = input instanceof Date ? input : new Date(input);
  return isValid(parsed) ? parsed : new Date();
};

export const isSubscriptionExpired = (endDate: string | Date): boolean => {
  const targetDate = startOfDay(parseDate(endDate));
  const today = startOfDay(new Date());

  return isAfter(today, targetDate);
};

export const getDateAfterDays = (days: number): Date => {
  return addDays(new Date(), days);
};

export const getDateAfterMonths = (months: number): Date => {
  return addMonths(new Date(), months);
};

export const getNumberOfTotalDays = (numberOfMonths: number): number => {
  return numberOfMonths * 30;
};

export const getStartAndEndDate = (
  startDate: Date,
  endDate: Date
): { startDate: Date; endDate: Date } => {
  return {
    startDate: startOfDay(parseDate(startDate)),
    endDate: endOfDay(parseDate(endDate)),
  };
};

// 
export const formatDate = (
  date: DateInput,
  pattern: DateFormatPattern = dateFormats.SHORT
): string => {
  if (!date) return 'N/A';

  const parsedDate = date instanceof Date ? date : new Date(date);

  if (!isValid(parsedDate)) {
    return 'N/A';
  }

  return format(parsedDate, pattern);
};