import { TableData } from "../dtos/common.dto";
import { UserDataView, UserDataQuery, UsersQuery, UsersView, ProvidersQuery, ProvidersView, ProviderByIdView, ProviderByIdQuery, ProviderStatsQuery, ProviderStatsView } from "../dtos/user.dto";


export interface IUserQueries {

    findStats(query: UserDataQuery): Promise<UserDataView>;

    findUsers(query: UsersQuery): Promise<TableData<UsersView>>;

    findProviders(query: ProvidersQuery): Promise<TableData<ProvidersView>>;

    findProviderById(query: ProviderByIdQuery): Promise<ProviderByIdView>;

    findproviderStats(query: ProviderStatsQuery): Promise<ProviderStatsView>;

}