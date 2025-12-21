import { AdminFetchAllSubscriptionsResponse, AdminFetchDashboardSubscriptionStatsDataResponse } from "../dtos/admin.dto";
import { ApiPaginationRequest, FetchProviderSubscriptionsRequest, findSubscriptionFullDetailsResProps, FindSubscriptionsByProviderIdResponse, TableData } from "../dtos/common.dto";

export interface ISubscriptionQueries {

    findSubscriptionsByProviderId(payload: FetchProviderSubscriptionsRequest): Promise<TableData<FindSubscriptionsByProviderIdResponse>>;

    findAllSubscriptions(pagination: ApiPaginationRequest): Promise<TableData<AdminFetchAllSubscriptionsResponse>>

    findSubscriptionFullDetails(subscriptionId: string): Promise<findSubscriptionFullDetailsResProps | null>;

    findSubscriptionsForUpdatinStatus(): Promise<boolean>;

    findSubscribedPlan(subscriptionId: string): Promise<string | boolean>;

    findSubscriptionStatsForAdminDashboard(): Promise<AdminFetchDashboardSubscriptionStatsDataResponse>;

};