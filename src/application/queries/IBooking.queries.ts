import { UserFetchProvidersForChatSidebarResponse } from "../dtos/user.dto";
import { AdminFetchDashboardAppointmentStatsDataResponse, AdminFetchTodaysBookingStatsForDashboardResponse } from "../dtos/admin.dto";
import { GetBookingDetailsResponse, GetBookingsRequest, GetBookingsResponse, GetOnlineBookingsForProviderResponse, GetOnlineBookingsForUserResponse, TableData } from "../dtos/common.dto";
import { ProviderFetchDashboardBookingStatsDataResponse, ProviderFetchDashboardGraphDataResponse, ProviderFetchDashboardGraphRepository, ProviderFetchUsersForChatSideBarResponse } from "../dtos/provider.dto";

export interface IBookingQueries {

    findTodaysBookingsForCronjob(): Promise<boolean>;

    findAll({ page, limit, userId, serviceProviderId, online, raw, role }: GetBookingsRequest): Promise<TableData<GetBookingsResponse | GetOnlineBookingsForProviderResponse | GetOnlineBookingsForUserResponse>>;

    findDetails(bookingId: string): Promise<GetBookingDetailsResponse | null>;

    findUsersforChatSideBar(providerId: string): Promise<ProviderFetchUsersForChatSideBarResponse>;

    findProvidersforChatSideBar(userId: string): Promise<UserFetchProvidersForChatSidebarResponse>;

    findStatsDataForProviderDashboard(providerId: string): Promise<ProviderFetchDashboardBookingStatsDataResponse>;

    findGraphDataForProviderDashboard(payload: ProviderFetchDashboardGraphRepository): Promise<ProviderFetchDashboardGraphDataResponse | null>;

    findTodayStatsDataForAdminDashboard(): Promise<AdminFetchTodaysBookingStatsForDashboardResponse>;

    findStatsDataForAdminDashboard(): Promise<AdminFetchDashboardAppointmentStatsDataResponse>;

};