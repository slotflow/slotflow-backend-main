import { CommonDateInput } from "./common.dto";
import { Role } from "../../domain/enums/common.enum";
import { PlanName } from "../../domain/enums/plan.enum";
import { ApiPaginationInput, StatMetric } from "./common.dto";
import { UserProps } from "../../domain/contracts/user.contract";
import { PlanProps } from "../../domain/contracts/plan.contract";
import { BillingCycle } from "../../domain/enums/subscription.enum";
import { SubscriptionProps } from "../../domain/contracts/subscription.contract";
import { TimeZone } from "../../domain/commands/user.commands";

/**
 * subscription queries dtos
 */

// findAll method
export interface SubscriptionsQuery extends ApiPaginationInput {
  providerId?: UserProps["_id"];
}
export type SubscriptionsView = Array<
  Pick<
    SubscriptionProps,
    "_id" | "currentPeriodStart" | "currentPeriodEnd" | "subscriptionStatus"
  > &
    Pick<PlanProps, "planName">
>;

// findSubscribedPlan method
export interface SubscribedPlanQuery {
  subscriptionId: SubscriptionProps["_id"];
}

// findDetails method
export interface SubscriptionDetailsQuery {
  subscriptionId: SubscriptionProps["_id"];
}
type SubscriptionDetailsProps = Pick<
  SubscriptionProps,
  | "_id"
  | "cancelAt"
  | "cancelAtPeriodEnd"
  | "currentPeriodStart"
  | "currentPeriodEnd"
  | "subscriptionStatus"
  | "createdAt"
>;
type PlanDetailsProps = Pick<PlanProps, "planName" | "adVisibility" | "maxBookingPerMonth">;
export interface SubscriptionDetailsView extends SubscriptionDetailsProps {
  subscribedPlanId: PlanDetailsProps;
}

// findStatsForAdminDashboard method
export interface SubscriptionStatsDataQuery extends CommonDateInput {
  timeZone: string;
}
export interface SubscriptionStatsDataView extends Record<string, StatMetric | undefined> {
  activeSubscriptions: StatMetric;
  expiredSubscriptions: StatMetric;
  subscriptionsByFreePlan: StatMetric;
  subscriptionsByStarterPlan: StatMetric;
  subscriptionsByProfessionalPlan: StatMetric;
  subscriptionsByEnterprisePlan: StatMetric;
}

// findMySubscritpion method
export interface MySubscriptionQuery {
  subscriptionId: SubscriptionProps["_id"];
}
export type MySubscriptionView = {
  subscribedPlan: PlanName;
} & Pick<
  SubscriptionProps,
  "providerId" | "currentPeriodStart" | "currentPeriodEnd" | "subscriptionStatus"
>;

// findAnalayticsForAdminDashboard method
export interface SubscriptionAnalyticsQuery extends CommonDateInput {
  timeZone: string;
}
export type SubscriptionAnalyticsView = Array<{
  status: string;
  value: number;
}>;

/**
 * subscription usecases dtos
 */

// getSubscribedPlan
export interface GetSubscribedPlanInput {
  providerId: UserProps["_id"];
}
export type GetSubscribedPlanOutput = MySubscriptionView;

// createSubscriptionSessionId
export interface SubscriptionCreateSessionIdInput {
  providerId: string;
  planId: string;
  billingCycle: BillingCycle;
  email: string;
  name: string;
  role: Role;
  timeZone: TimeZone;
}
export interface SubscriptionCreateSessionIdOutput {
  sessionId: string;
}

// getSubscriptions
export interface GetSubscriptionsInput extends ApiPaginationInput {
  providerId?: UserProps["_id"];
}
export type GetSubscriptionsOutput = Array<
  Pick<
    SubscriptionProps,
    "_id" | "currentPeriodStart" | "currentPeriodEnd" | "subscriptionStatus"
  > &
    Pick<PlanProps, "planName">
>;

// getSubscriptionDetails
export type GetSubscriptionDetailsInput = SubscriptionDetailsQuery;
export type GetSubscriptionDetailsOutput = SubscriptionDetailsView;

// getSubscriptionsChartData
export type GetSubscriptionsChartDataInput = SubscriptionAnalyticsQuery;
export type GetSubscriptionsChartDataOutput = SubscriptionAnalyticsView;

// Support types
export interface PopulatedPlan {
  subscribedPlanId: {
    planName: PlanName;
  };
}
