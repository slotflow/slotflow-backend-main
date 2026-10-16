import { IdType } from "../types/enums";
import { CookieOptions } from "express";
import { appConfig } from "../../../config/env";
import { Day } from "../../../domain/enums/common.enum";

// time zone default constant
export const defaultTimezone: string = "Asia/Kolkata";

// Base cookie options
const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: appConfig.nodeEnv !== "development",
  sameSite: appConfig.nodeEnv === "development" ? "lax" : "none",
};

// Access token - 1 hour
export const accessTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: 60 * 60 * 1000,
  path: "/",
};

// Refresh token - 2 days
export const refreshTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: 2 * 24 * 60 * 60 * 1000,
  path: "/",
};

// Registration, reset request, reset grant - 5 minutes
export const temporaryCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: 5 * 60 * 1000,
  path: "/",
};

// Clear any cookie created with these options
export const clearAuthCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  path: "/",
};

// Password reset config
export const passwordRestConfig = {
  otpTTL: 5 * 60,
  grantTTL: 5 * 60,
  maxAttempts: 5,
} as const;

// Date formats
export const dateFormats = {
  SHORT: "dd MMM yyyy", // 16 Sep 2026
  FULL: "dd MMMM yyyy", // 16 September 2026
  WITH_TIME: "dd MMM yyyy, hh:mm a", // 16 Sep 2026, 02:55 PM
  WITH_FULL_TIME: "MM/dd/yyyy, hh:mm:ss a", // 09/16/2026, 02:55:16 PM (Replaces toLocaleString)
  ISO_DATE: "yyyy-MM-dd", // 2026-09-16
  TIME_12H: "hh:mm a", // 02:55 PM
  TIME_12H_LOWER: "hh:mm aa", // 02:55 pm
  TIME_24H: "HH:mm", // 14:55
  RANGE_MONTH_DAY: "LLL dd", // Sep 16
  RANGE_FULL: "LLL dd, yyyy", // Sep 16, 2026
} as const;

export const daysOfWeek: Day[] = [
  Day.SUNDAY,
  Day.MONDAY,
  Day.TUESDAY,
  Day.WEDNESDAY,
  Day.THURSDAY,
  Day.FRIDAY,
  Day.SATURDAY,
];

export const PREFIX_MAP: Record<IdType, string> = {
  [IdType.EVENT]: "sf_evt_",
  [IdType.TRANSACTION]: "sf_trx_",
  [IdType.ROOM]: "sf_room_",
  [IdType.IDEMPOTENCY]: "sf_idem_",
  [IdType.FILE]: "sf_file_",
  [IdType.REFERRAL]: "sf_ref_",
  [IdType.CREDIT_TRANSACTION]: "sf_crtsn",
} as const;
