import { SubscriptionStatus } from "../enums/subscription.enum";

export interface SubscriptionProps {
    _id: string,
    providerId: string,
    subscriptionPlanId: string,
    startDate: Date,
    endDate: Date,
    subscriptionStatus: SubscriptionStatus,
    paymentId: string | null,
    createdAt: Date,
    updatedAt: Date,
}