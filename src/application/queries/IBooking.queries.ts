import { UserFetchProvidersForChatSidebarResponse } from "../dtos/user.dto";
import { AdminFetchDashboardAppointmentStatsDataResponse, AdminFetchTodaysBookingStatsForDashboardResponse } from "../dtos/admin.dto";
import { FetchBookingDetailsResponse, FetchBookingsRequest, FetchBookingsResponse, FetchOnlineBookingsForProviderResponse, FetchOnlineBookingsForUserResponse, TableData } from "../dtos/common.dto";
import { ProviderFetchDashboardBookingStatsDataResponse, ProviderFetchDashboardGraphDataResponse, ProviderFetchDashboardGraphRepository, ProviderFetchUsersForChatSideBarResponse } from "../dtos/provider.dto";

export interface IBookingQueries {

    findTodaysBookingForCronjob(): Promise<boolean>;

    findAll({ page, limit, userId, serviceProviderId, online, raw, role }: FetchBookingsRequest): Promise<TableData<FetchBookingsResponse | FetchOnlineBookingsForProviderResponse | FetchOnlineBookingsForUserResponse>>;

    findDetails(bookingId: string): Promise<FetchBookingDetailsResponse | null>;

    findUsersforChatSideBar(providerId: string): Promise<ProviderFetchUsersForChatSideBarResponse>;

    findProvidersforChatSideBar(userId: string): Promise<UserFetchProvidersForChatSidebarResponse>;

    findStatsDataForProviderDashboard(providerId: string): Promise<ProviderFetchDashboardBookingStatsDataResponse>;

    findGraphDataForProviderDashboard(payload: ProviderFetchDashboardGraphRepository): Promise<ProviderFetchDashboardGraphDataResponse | null>;

    findTodayStatsForAdminDashboard(): Promise<AdminFetchTodaysBookingStatsForDashboardResponse>;

    findStatsForAdminDashboard(): Promise<AdminFetchDashboardAppointmentStatsDataResponse>;

};