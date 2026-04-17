import { PlanName } from "../../domain/enums/plan.enum";
import { GetStatsDataCommonInput } from "./admin.dto";
import { ApiPaginationInput, PlanDTO, SubscriptionDTO, UserDTO } from "./common.dto";
import { SubscriptionStatus, SubscriptionValidity } from "../../domain/enums/subscription.enum";

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
type PlanProps = Pick<PlanDTO, "planName" | "price" | "adVisibility" | "maxBookingPerMonth">;
export interface SubscriptionDetailsView extends SubscriptionProps {
    subscriptionPlanId: PlanProps,
}

// 4. findStatsForAdminDashboard method parameter and return
export interface SubscriptionStatsForAdminQuery extends GetStatsDataCommonInput { }
export interface SubscriptionStatsForAdminView {
    activeSubscriptions: number;
    expiredSubscriptions: number;
    subscriptionsByFreePlan: number;
    subscriptionsByStarterPlan: number;
    subscriptionsByProfessionalPlan: number;
    subscriptionsByEnterprisePlan: number;
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










//// **** subscription usecases input output **** ////

// 1. getSubscriptionData usecase input output
export type GetSubscriptionDataInput = SubscriptionStatsForAdminQuery;
export type GetSubscriptionDataOutput = SubscriptionStatsForAdminView;

// 2. getSubscribedPlan usecase input output
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

// 3. createSubscriptionSessionId usecase input output
export interface SubscriptionCreateSessionIdInput {
    providerId: string;
    planId: string;
    planDuration: SubscriptionValidity;
}

// 4. trialSubscription usecase input output
export interface TrialSubscriptionInput {
    providerId: string;
}

// 5. getSubscriptions usecase input output
export interface GetSubscriptionsInput extends ApiPaginationInput {
    providerId?: UserDTO["_id"];
}
export type GetSubscriptionsOutput = Array<Pick<SubscriptionDTO, "_id" | "startDate" | "endDate" | "subscriptionStatus"> & Pick<PlanDTO, "planName">>;

// 6. getSubscriptionDetails usecase input output
export type GetSubscriptionDetailsInput = SubscriptionDetailsQuery;
export type GetSubscriptionDetailsOutput = SubscriptionDetailsView;





// Support types

export interface PopulatedPlan {
    subscriptionPlanId: {
        planName: PlanName;
    }
}
















