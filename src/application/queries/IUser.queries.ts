import { TableData } from "../dtos/common.dto";
import { UserStatsDataView, UserStatsDataQuery, UsersQuery, UsersView, ProvidersQuery, ProvidersView, ProviderByIdView, ProviderByIdQuery, ProviderStatsDataQuery, ProviderStatsDataView, UserChartDataQuery, UserChartDataView } from "../dtos/user.dto";


export interface IUserQueries {

    findStats(query: UserStatsDataQuery): Promise<UserStatsDataView>;

    findUsers(query: UsersQuery): Promise<TableData<UsersView>>;

    findProviders(query: ProvidersQuery): Promise<TableData<ProvidersView>>;

    findProviderById(query: ProviderByIdQuery): Promise<ProviderByIdView>;

    findproviderStats(query: ProviderStatsDataQuery): Promise<ProviderStatsDataView>;

    findAdminDashboardUserChartData(query: UserChartDataQuery): Promise<UserChartDataView>;

}