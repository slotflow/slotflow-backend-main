import { ProviderFetchSubscribedPlanResponse } from "../dtos/provider.dto";
import { AdminFetchAllSubscriptionsResponse, AdminFetchDashboardSubscriptionStatsDataResponse } from "../dtos/admin.dto";
import { ApiPaginationRequest, FetchProviderSubscriptionsRequest, findSubscriptionFullDetailsResProps, FindSubscriptionsByProviderIdResponse, TableData } from "../dtos/common.dto";

export interface ISubscriptionQueries {

    findAll(pagination: ApiPaginationRequest): Promise<TableData<AdminFetchAllSubscriptionsResponse>>
    
    findSubscribedPlan(subscriptionId: string): Promise<string | boolean>;
    
    findDetails(subscriptionId: string): Promise<findSubscriptionFullDetailsResProps | null>;
    
    findStatsForAdminDashboard(): Promise<AdminFetchDashboardSubscriptionStatsDataResponse>;
    
    findByProviderId(payload: FetchProviderSubscriptionsRequest): Promise<TableData<FindSubscriptionsByProviderIdResponse>>;
    
    findSubscriptionsForUpdatinStatus(): Promise<boolean>;

    findMySubscritpion(subscriptionId: string): Promise<ProviderFetchSubscribedPlanResponse | null>;

};