export enum Role {
    ADMIN = "ADMIN",
    USER = "USER",
    PROVIDER = "PROVIDER",
};

export enum FileType {
    PNG="image/png",
    JPEG="image/jpeg",
    JPG="image/jpg"
};

export enum Day {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

export enum AppConnect {
    GOOGLE = "GOOGLE",
    STRIPE = "STRIPE",
    NOTION = "NOTION",
    WHATSAPP = "WHATSAPP",
    RAZORPAY = "RAZORPAY",
    PAYPAL = "PAYPAL",
};

export enum OtpPurpose {
  REGISTRATION = "REGISTRATION",
  PASSWORD_RESET = "PASSWORD_RESET",
};

export enum CalendarStatus {
    PENDING = "PENDING",
    CREATED = "CREATED",
    FAILED = "FAILED",
}

export enum EventStatus {
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    PENDING = "PENDING",
    RETRY = "RETRY",
}

export enum HearAboutUsOptionValue {
  GOOGLE = 'GOOGLE',
  REFERRAL = 'REFERRAL',
  YOUTUBE = 'YOUTUBE',
  LINKEDIN = 'LINKEDIN',
  TWITTER = 'TWITTER',
  INSTAGRAM = 'INSTAGRAM',
  WHATSAPP = 'WHATSAPP',
  FACEBOOK = 'FACEBOOK',
  THREADS = 'THREADS',
  OTHER = 'OTHER',
}

export enum OnboardingStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ReferralStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  REWARDED = "REWARDED",
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
  SMS = 'SMS',
}

export enum NotificationType {
  ACCOUNT_ACTIVITY = 'ACCOUNT_ACTIVITY',
  SYSTEM_UPDATES = 'SYSTEM_UPDATES',
  PROMOTIONAL_UPDATES = 'PROMOTIONAL_UPDATES',
}