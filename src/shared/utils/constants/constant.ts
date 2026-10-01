import { IdType } from "../types/enums";
import { Day } from "../../../domain/enums/common.enum";
import { NotificationChannel, NotificationType } from "../../../application/dtos/common.dto";
import { appConfig } from "../../../config/env";

// time zone default constant
export const defaultTimezone: string = "Asia/Kolkata";

// cookies options
export const cookieOptions: {
  maxAge: number;
  httpOnly: boolean;
  sameSite: 'none' | 'lax' | 'strict';
  secure: boolean;
} = {
  maxAge: 2 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: appConfig.nodeEnv === 'development' ? 'lax' : 'none',
  secure: appConfig.nodeEnv !== 'development'
}

//
export const dateFormats = {
  SHORT: 'dd MMM yyyy',                 // 16 Sep 2026
  FULL: 'dd MMMM yyyy',                  // 16 September 2026
  WITH_TIME: 'dd MMM yyyy, hh:mm a',        // 16 Sep 2026, 02:55 PM
  WITH_FULL_TIME: 'MM/dd/yyyy, hh:mm:ss a', // 09/16/2026, 02:55:16 PM (Replaces toLocaleString)
  ISO_DATE: 'yyyy-MM-dd',                // 2026-09-16
  TIME_12H: 'hh:mm a',                   // 02:55 PM
  TIME_12H_LOWER: 'hh:mm aa',             // 02:55 pm
  TIME_24H: 'HH:mm',                     // 14:55
  RANGE_MONTH_DAY: 'LLL dd',             // Sep 16
  RANGE_FULL: 'LLL dd, yyyy',            // Sep 16, 2026
} as const;

export const daysOfWeek: Day[] = [
  Day.SUNDAY,
  Day.MONDAY,
  Day.TUESDAY,
  Day.WEDNESDAY,
  Day.THURSDAY,
  Day.FRIDAY,
  Day.SATURDAY
];

export const PREFIX_MAP: Record<IdType, string> = {
  [IdType.EVENT]: "sf_evt_",
  [IdType.TRANSACTION]: "sf_trx_",
  [IdType.ROOM]: "sf_room_",
  [IdType.IDEMPOTENCY]: "sf_idem_",
  [IdType.FILE]: "sf_file_",
  [IdType.REFERRAL]: "sf_ref_",
  [IdType.CREDIT_TRANSACTION]: "sf_crtsn"
} as const;

export const notificationChannel = {
  EMAIL: 'email',
  PUSH: 'push',
  IN_APP: 'in_app',
} as const satisfies Record<string, NotificationChannel>;

export const notificationType = {
  ACCOUNT_ACTIVITY: 'account_activity',
  SYSTEM_UPDATES: 'system_updates',
  PROMOTIONAL_UPDATES: 'promotional_updates',
} as const satisfies Record<string, NotificationType>;