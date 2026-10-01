import { SubscriptionProps } from "../contracts/subscription.contract";

export type CreateSubscriptionInitialProps = Omit<
  SubscriptionProps,
  | "_id"
  | "createdAt"
  | "updatedAt"
  | "paymentId"
  | "currentPeriodStart"
  | "currentPeriodEnd"
  | "subscriptionStatus"
  | "cancelAtPeriodEnd"
  | "cancelAt"
  | "lastEventAt"
>;

export type SubscriptionPaymentSuccessProps = Pick<
SubscriptionProps, 
| "currentPeriodEnd" 
| "currentPeriodStart" 
| "paymentId"
| "cancelAt"
| "cancelAtPeriodEnd" 
| "lastEventAt"
>;