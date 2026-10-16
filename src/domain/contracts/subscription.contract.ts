import { SubscriptionStatus } from "../enums/subscription.enum";

export interface SubscriptionProps {
  _id: string;
  providerId: string;
  subscribedPlanId: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  subscriptionStatus: SubscriptionStatus;
  cancelAtPeriodEnd: boolean | null;
  cancelAt: Date | null;
  lastEventAt: Date | null;
  paymentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
