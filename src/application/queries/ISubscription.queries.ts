import { GetSubscribedPlanResponse } from "../dtos/subscription";
import { GetSubscriptionDataRequest, GetSubscriptionDataResponse } from "../dtos/admin.dto";
import { GetSubscriptionsRequest, GetSubscriptionsResponse, GetSubscriptionDetailsResponse, TableData } from "../dtos/common.dto";

export interface ISubscriptionQueries {

    findAll(payload: GetSubscriptionsRequest): Promise<TableData<GetSubscriptionsResponse>>

    findSubscribedPlan(subscriptionId: string): Promise<string | boolean>;

    findDetails(subscriptionId: string): Promise<GetSubscriptionDetailsResponse | null>;

    findStatsForAdminDashboard(payload: GetSubscriptionDataRequest): Promise<GetSubscriptionDataResponse>;

    findSubscriptionsForUpdatinStatus(): Promise<boolean>;

    findMySubscritpion(subscriptionId: string): Promise<GetSubscribedPlanResponse | null>;

};