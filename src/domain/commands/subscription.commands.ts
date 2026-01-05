import { SubscriptionProps } from "../contracts/subscription.contract";

export type CreateSubscriptionProps = Omit<SubscriptionProps, "_id" | "createdAt" | "updatedAt" | "paymentId"> & Partial<Pick<SubscriptionProps, "paymentId">>;

export type UpdateSubscriptionProps = Omit<SubscriptionProps, "_id" | "createdAt" | "updatedAt">;