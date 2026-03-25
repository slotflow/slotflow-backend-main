import { PlanName } from "../../domain/enums/plan.enum";
import { SubscriptionStatus, SubscriptionValidity } from "../../domain/enums/subscription.enum";

export type GetSubscribedPlanRequest = {
    providerId: string;
};

export interface GetSubscribedPlanResponse {
    providerId: string;
    subscribedPlan: PlanName;
    startDate: Date;
    endDate: Date;
    subscriptionStatus: SubscriptionStatus
};

export interface SubscriptionCreateSessionIdRequest {
    providerId: string;
    planId: string;
    planDuration: SubscriptionValidity;
}

export interface TrialSubscriptionRequest {
    providerId: string;
}
