export enum Role {
    ADMIN = "ADMIN",
    USER = "USER",
    PROVIDER = "PROVIDER",
};

export enum Boolean {
    TRUE = "true",
    FALSE = "false"
};

export enum FileType {
    PNG="image/png",
    JPEG="image/jpeg",
    JPG="image/jpg"
};

export enum Day {
    SUNDAY = "Sunday",
    MONDAY = "Monday",
    TUESDAY = "Tuesday",
    WEDNESDAY = "Wednesday",
    THURSDAY = "Thursday",
    FRIDAY = "Friday",
    SATURDAY = "Saturday",
};

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
  GOOGLE = "google",
  REFERRAL = "referral",
  YOUTUBE = "youtube",
  LINKEDIN = "linkedin",
  TWITTER = "twitter",
  INSTAGRAM = "instagram",
  WHATSAPP = "whatsapp",
  FACEBOOK = "facebook",
  THREADS = "threads",
  OTHER = "other",
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