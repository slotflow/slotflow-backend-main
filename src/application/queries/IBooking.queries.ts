import { GetBookingsDataRequest, GetBookingsDataResponse } from "../dtos/admin.dto";
import { GetBookingDetailsResponse, GetBookingsRequest, GetBookingsResponse, GetOnlineBookingsForProviderResponse, GetOnlineBookingsForUserResponse, TableData } from "../dtos/common.dto";
import { ProviderGetDashboardBookingStatsDataResponse, GetGraphDataResponse, ProviderGetDashboardGraphRepository, ProviderGetUsersForChatSideBarResponse, GetProvidersForChatResponse, ProviderGetDashboardBookingStatsDataRequest } from "../dtos/provider.dto";

export interface IBookingQueries {

    findTodaysBookingsForCronjob(): Promise<boolean>;

    findAll({ page, limit, userId, serviceProviderId, online, role }: GetBookingsRequest): Promise<TableData<GetBookingsResponse | GetOnlineBookingsForProviderResponse | GetOnlineBookingsForUserResponse>>;

    findDetails(bookingId: string): Promise<GetBookingDetailsResponse | null>;

    findUsersforChatSideBar(providerId: string): Promise<ProviderGetUsersForChatSideBarResponse>;

    findProvidersforChatSideBar(userId: string): Promise<GetProvidersForChatResponse>;

    findStatsDataForProviderDashboard(payload: ProviderGetDashboardBookingStatsDataRequest): Promise<ProviderGetDashboardBookingStatsDataResponse>;

    findGraphDataForProviderDashboard(payload: ProviderGetDashboardGraphRepository): Promise<GetGraphDataResponse | null>;

    findStatsDataForAdminDashboard(payload: GetBookingsDataRequest): Promise<GetBookingsDataResponse>;

};