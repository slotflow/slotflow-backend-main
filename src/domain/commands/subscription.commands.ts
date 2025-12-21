import { SubscriptionProps } from "../contracts/subscription.contract";

export type CreateSubscriptionProps = Omit<SubscriptionProps, "_id" | "createdAt" | "updatedAt">;

export type UpdateSubscriptionProps = Omit<SubscriptionProps, "_id" | "createdAt" | "updatedAt">;