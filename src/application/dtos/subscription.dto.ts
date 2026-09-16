import { CommonDateInput } from "./common.dto";
import { PlanName } from "../../domain/enums/plan.enum";
import { BillingCycle, SubscriptionStatus } from "../../domain/enums/subscription.enum";
import { ApiPaginationInput, PlanDTO, StatMetric, SubscriptionDTO, UserDTO } from "./common.dto";
import { Role } from "../../domain/enums/common.enum";

//// **** subscription queries parameter and return **** ////

// findAll method parameter and return
export interface SubscriptionsQuery extends ApiPaginationInput {
    providerId?: UserDTO["_id"];
}
export type SubscriptionsView = Array<Pick<SubscriptionDTO, "_id" | "startDate" | "endDate" | "subscriptionStatus"> & Pick<PlanDTO, "planName">>;


// 2. findSubscribedPlan method parameter
export interface SubscribedPlanQuery {
    subscriptionId: SubscriptionDTO["_id"];
}


// 3. findDetails method parameter and return
export interface SubscriptionDetailsQuery {
    subscriptionId: SubscriptionDTO["_id"];
}
type SubscriptionProps = Pick<SubscriptionDTO, "startDate" | "endDate" | "subscriptionStatus" | "createdAt">;
type PlanProps = Pick<PlanDTO, "planName" | "adVisibility" | "maxBookingPerMonth">;
export interface SubscriptionDetailsView extends SubscriptionProps {
    subscriptionPlanId: PlanProps,
}


// 4. findStatsForAdminDashboard method parameter and return
export interface SubscriptionStatsDataQuery extends CommonDateInput { }
export interface SubscriptionStatsDataView extends Record<string, StatMetric | undefined> {
    activeSubscriptions: StatMetric;
    expiredSubscriptions: StatMetric;
    subscriptionsByFreePlan: StatMetric;
    subscriptionsByStarterPlan: StatMetric;
    subscriptionsByProfessionalPlan: StatMetric;
    subscriptionsByEnterprisePlan: StatMetric;
};


// 5. findMySubscritpion method parameter and return
export interface MySubscriptionQuery {
    subscriptionId: SubscriptionDTO["_id"];
}
export interface MySubscriptionView {
    providerId: string;
    subscribedPlan: PlanName;
    startDate: Date;
    endDate: Date;
    subscriptionStatus: SubscriptionStatus
};


// 6. findAnalayticsForAdminDashboard method parameter and return
export interface SubscriptionAnalyticsQuery extends CommonDateInput { }
export type SubscriptionAnalyticsView = Array<{
    status: string;
    value: number;
}>










//// **** subscription usecases input output **** ////

// getSubscribedPlan usecase input output
export interface GetSubscribedPlanInput {
    providerId: UserDTO["_id"]
};
export interface GetSubscribedPlanOutput {
    providerId: string;
    subscribedPlan: PlanName;
    startDate: Date;
    endDate: Date;
    subscriptionStatus: SubscriptionStatus
};


// createSubscriptionSessionId usecase input output
export interface SubscriptionCreateSessionIdInput {
    providerId: string;
    planId: string;
    billingCycle: BillingCycle,
    email: string;
    name: string;
    role: Role;
}
export interface SubscriptionCreateSessionIdOutput {
    sessionId: string;
}


// trialSubscription usecase input output
export interface TrialSubscriptionInput {
    providerId: string;
}
export interface TrialSubscriptionOutput {
    subscribedPlan: PlanName,
    startDate: Date,
    endDate: Date,
    subscriptionStatus: SubscriptionStatus,
    _id: string;
}


// getSubscriptions usecase input output
export interface GetSubscriptionsInput extends ApiPaginationInput {
    providerId?: UserDTO["_id"];
}
export type GetSubscriptionsOutput = Array<Pick<SubscriptionDTO, "_id" | "startDate" | "endDate" | "subscriptionStatus"> & Pick<PlanDTO, "planName">>;


// getSubscriptionDetails usecase input output
export type GetSubscriptionDetailsInput = SubscriptionDetailsQuery;
export type GetSubscriptionDetailsOutput = SubscriptionDetailsView;


// getSubscriptionsChartData usecase input outpue
export type GetSubscriptionsChartDataInput = SubscriptionAnalyticsQuery;
export type GetSubscriptionsChartDataOutput = SubscriptionAnalyticsView;










// Support types
export interface PopulatedPlan {
    subscriptionPlanId: {
        planName: PlanName;
    }
}
















