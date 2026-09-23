import { isValid } from "date-fns";

export const parseDate = (input: string | number | Date): Date => {
  const parsed = input instanceof Date ? input : new Date(input);
  return isValid(parsed) ? parsed : new Date();
};