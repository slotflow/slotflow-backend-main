import { TableData } from "../dtos/common.dto";
import { MySubscriptionQuery, MySubscriptionView, SubscribedPlanQuery, SubscriptionDetailsQuery, SubscriptionDetailsView, SubscriptionsQuery, SubscriptionStatsForAdminQuery, SubscriptionStatsForAdminView, SubscriptionsView } from "../dtos/subscription.dto";

export interface ISubscriptionQueries {

    findAll(query: SubscriptionsQuery): Promise<TableData<SubscriptionsView>>

    findSubscribedPlan(query: SubscribedPlanQuery): Promise<string | boolean>;

    findDetails(query: SubscriptionDetailsQuery): Promise<SubscriptionDetailsView | null>;

    findStatsForAdminDashboard(query: SubscriptionStatsForAdminQuery): Promise<SubscriptionStatsForAdminView>;

    findSubscriptionsForUpdatinStatus(): Promise<boolean>;

    findMySubscritpion(query: MySubscriptionQuery): Promise<MySubscriptionView | null>;

};