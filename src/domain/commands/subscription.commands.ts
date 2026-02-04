import { SubscriptionProps } from "../contracts/subscription.contract";

export type CreateSubscriptionInitialProps = Omit<SubscriptionProps, "_id" | "createdAt" | "updatedAt" | "paymentId" | "paymentStatus" | "startDate" | "endDate" | "subscriptionStatus" | "paymentStatus">;

export type CreateSubscriptionProps = Omit<SubscriptionProps, "_id" | "createdAt" | "updatedAt" | "paymentId" | "paymentStatus">

export type SubscriptionPaymentSuccessProps = Pick<SubscriptionProps, "startDate" | "endDate" | "paymentId">;