import { ProviderFetchSubscribedPlanResponse } from "../dtos/provider.dto";
import { AdminFetchDashboardSubscriptionStatsDataResponse } from "../dtos/admin.dto";
import { GetSubscriptionsRequest, GetSubscriptionsResponse, GetSubscriptionDetailsResponse, TableData } from "../dtos/common.dto";

export interface ISubscriptionQueries {

    findAll(payload: GetSubscriptionsRequest): Promise<TableData<GetSubscriptionsResponse>>
    
    findSubscribedPlan(subscriptionId: string): Promise<string | boolean>;
    
    findDetails(subscriptionId: string): Promise<GetSubscriptionDetailsResponse | null>;
    
    findStatsForAdminDashboard(): Promise<AdminFetchDashboardSubscriptionStatsDataResponse>;
        
    findSubscriptionsForUpdatinStatus(): Promise<boolean>;

    findMySubscritpion(subscriptionId: string): Promise<ProviderFetchSubscribedPlanResponse | null>;

};