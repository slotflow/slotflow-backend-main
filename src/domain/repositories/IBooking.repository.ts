import { Types } from "mongoose";
import { User } from "../entities/user.entity";
import { Booking } from "../entities/booking.entity";
import { Provider } from "../entities/provider.entity";
import { UserFetchProvidersForChatSidebarResponse } from "../../infrastructure/dtos/user.dto";
import { ApiResponse, FetchBookingsRequest, FetchBookingsResponse } from "../../infrastructure/dtos/common.dto";
import { ProviderFetchDashboardBookingStatsDataResponse, ProviderFetchDashboardGraphDataResponse, ProviderFetchUsersForChatSideBar } from "../../infrastructure/dtos/provider.dto";
import { AdminFetchDashboardTodayStatsDataResponse } from "../../infrastructure/dtos/admin.dto";

export type CreateBookingPayloadProps = Pick<Booking, "serviceProviderId" | "userId" | "appointmentDate" | "appointmentTime" | "appointmentMode" | "appointmentStatus" | "slotId" | "paymentId">;
export type AdminFetchTodaysBookingStatsForDashboardResponse = Pick<AdminFetchDashboardTodayStatsDataResponse, "todaysAppointments" | "todaysCancelledAppointments" | "todaysCompletedAppointments">;

export interface IBookingRepository {

    createBooking(booking : CreateBookingPayloadProps, options : { session : any }) : Promise<Booking>;

    findBookingByUserId(userId: Types.ObjectId, day: string, date: Date, time: string): Promise<Array<Booking> | null>;

    findBookingById(bookingId: Types.ObjectId): Promise<Booking | null>;

    updateBooking(booking: Booking) : Promise<Booking | null>;

    findTodaysBookingForCronjob() : Promise<boolean> ;

    findAllBookings({ page, limit, userId, serviceProviderId }: FetchBookingsRequest) : Promise<ApiResponse<FetchBookingsResponse>>;

    findUsersforChatSideBar(providerId: Provider["_id"]): Promise<ProviderFetchUsersForChatSideBar>;
    
    findProvidersforChatSideBar(userId: User["_id"]): Promise<UserFetchProvidersForChatSidebarResponse>;

    findBookingStatsDataForDashboard(providerId: Provider["_id"]): Promise<ProviderFetchDashboardBookingStatsDataResponse>;

    findBookingGraphDataForDashboard(providerId: Provider["_id"]): Promise<ProviderFetchDashboardGraphDataResponse>;

    findTodayBookingStatsForAdminDashboard(): Promise<AdminFetchTodaysBookingStatsForDashboardResponse>;
}