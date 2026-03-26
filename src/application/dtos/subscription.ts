import { PlanName } from "../../domain/enums/plan.enum";
import { SubscriptionStatus, SubscriptionValidity } from "../../domain/enums/subscription.enum";

// get subscribed plan request payload interface
export type GetSubscribedPlanRequest = {
    providerId: string;
};

// get subscribed plan response interface
export interface GetSubscribedPlanResponse {
    providerId: string;
    subscribedPlan: PlanName;
    startDate: Date;
    endDate: Date;
    subscriptionStatus: SubscriptionStatus
};

// subscription create session id request payload interface
export interface SubscriptionCreateSessionIdRequest {
    providerId: string;
    planId: string;
    planDuration: SubscriptionValidity;
}

// trial subscription request payload interface
export interface TrialSubscriptionRequest {
    providerId: string;
}
