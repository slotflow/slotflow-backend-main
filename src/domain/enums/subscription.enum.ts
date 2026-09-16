export enum SubscriptionStatus {
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED",
    PENDING = "PENDING",
    PAST_DUE = "PAST_DUE",
    FAILED = "FAILED",
};

// need to remove
export enum SubscriptionValidity {
    SEVEN_DAYS = 7,
    ONE_MONTH = 30,
    THREE_MONTHS = 90,
    SIX_MONTHS = 180,
    TWELVE_MONTHS = 360,
};

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}