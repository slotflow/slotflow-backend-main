import {
  format,
  isValid,
} from 'date-fns';
import { dateFormats } from '../constants/constant';
import { DateFormatPattern, DateInput } from '../types/types';

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