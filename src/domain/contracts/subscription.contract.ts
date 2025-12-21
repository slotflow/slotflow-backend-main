import { SubscriptionStatus } from "../enums/subscriptionStatus.enum";

export interface SubscriptionProps {
    _id: string,
    providerId: string,
    subscriptionPlanId: string,
    startDate: Date,
    endDate: Date,
    subscriptionStatus: SubscriptionStatus,
    paymentId: string,
    createdAt: Date,
    updatedAt: Date,
}