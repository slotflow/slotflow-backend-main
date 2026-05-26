export enum CreditTransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT"
}

export enum CreditTransactionSource {
  REFERRAL = "REFERRAL",
  BOOKING_DISCOUNT = "BOOKING_DISCOUNT",
  SUBSCRIPTION_DISCOUNT = "SUBSCRIPTION_DISCOUNT",
  ADMIN = "ADMIN",
  PROMOTION = "PROMOTION"
}

export enum CreditTransactionStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED"
}

export enum RewardPoints {
  SUBSCRIPTION = 100,
  BOOKING = 100
}