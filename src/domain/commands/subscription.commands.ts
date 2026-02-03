import { SubscriptionProps } from "../contracts/subscription.contract";

export type CreateSubscriptionProps = Omit<SubscriptionProps, "_id" | "createdAt" | "updatedAt" | "paymentId" | "paymentStatus" | "subscriptionStatus" | "startDate" | "endDate">;

export type SubscriptionPaymentSuccessProps = Pick<SubscriptionProps, "startDate" | "endDate" | "paymentId">;