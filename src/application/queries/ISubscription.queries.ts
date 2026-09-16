import { TableData } from "../dtos/common.dto";
import { MySubscriptionQuery, MySubscriptionView, SubscribedPlanQuery, SubscriptionAnalyticsQuery, SubscriptionAnalyticsView, SubscriptionDetailsQuery, SubscriptionDetailsView, SubscriptionsQuery, SubscriptionStatsDataQuery, SubscriptionStatsDataView, SubscriptionsView } from "../dtos/subscription.dto";

export interface ISubscriptionQueries {

    findAll(query: SubscriptionsQuery): Promise<TableData<SubscriptionsView>>

    findSubscribedPlan(query: SubscribedPlanQuery): Promise<string | boolean>;

    findDetails(query: SubscriptionDetailsQuery): Promise<SubscriptionDetailsView | null>;

    findStatsForAdminDashboard(query: SubscriptionStatsDataQuery): Promise<SubscriptionStatsDataView>;

    findSubscriptionsForUpdatinStatus(): Promise<boolean>;

    findMySubscritpion(query: MySubscriptionQuery): Promise<MySubscriptionView | null>;

    findAnalyticsForAdminDashboard(query: SubscriptionAnalyticsQuery): Promise<SubscriptionAnalyticsView>;

};