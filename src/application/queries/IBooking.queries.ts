import { FetchBookingsDataRequest, FetchBookingsDataResponse } from "../dtos/admin.dto";
import { GetBookingDetailsResponse, GetBookingsRequest, GetBookingsResponse, GetOnlineBookingsForProviderResponse, GetOnlineBookingsForUserResponse, TableData } from "../dtos/common.dto";
import { ProviderFetchDashboardBookingStatsDataResponse, FetchGraphDataResponse, ProviderFetchDashboardGraphRepository, ProviderFetchUsersForChatSideBarResponse, GetProvidersForChatResponse } from "../dtos/provider.dto";

export interface IBookingQueries {

    findTodaysBookingsForCronjob(): Promise<boolean>;

    findAll({ page, limit, userId, serviceProviderId, online, role }: GetBookingsRequest): Promise<TableData<GetBookingsResponse | GetOnlineBookingsForProviderResponse | GetOnlineBookingsForUserResponse>>;

    findDetails(bookingId: string): Promise<GetBookingDetailsResponse | null>;

    findUsersforChatSideBar(providerId: string): Promise<ProviderFetchUsersForChatSideBarResponse>;

    findProvidersforChatSideBar(userId: string): Promise<GetProvidersForChatResponse>;

    findStatsDataForProviderDashboard(providerId: string): Promise<ProviderFetchDashboardBookingStatsDataResponse>;

    findGraphDataForProviderDashboard(payload: ProviderFetchDashboardGraphRepository): Promise<FetchGraphDataResponse | null>;

    findStatsDataForAdminDashboard(payload: FetchBookingsDataRequest): Promise<FetchBookingsDataResponse>;

};