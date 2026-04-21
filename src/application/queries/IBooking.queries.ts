import { TableData } from "../dtos/common.dto";
import { BookingDetailsQuery, BookingDetailsView, BookingGraphStatsForProviderQuery, BookingGraphStatsForProviderView, BookingsQuery, BookingsStatsForAdminQuery, BookingsStatsForAdminView, BookingStatsForProviderQuery, BookingStatsForProviderView, BookingsView, BookingUsersForChatQuery, BookingUsersForChatView } from "../dtos/booking.dto";

export interface IBookingQueries {

    findTodaysBookingsForCronjob(): Promise<boolean>;

    findAll(query: BookingsQuery): Promise<TableData<BookingsView>>;

    findDetails(query: BookingDetailsQuery): Promise<BookingDetailsView | null>;

    findUsersforChatSideBar(query: BookingUsersForChatQuery): Promise<BookingUsersForChatView>;

    findStatsDataForProviderDashboard(query: BookingStatsForProviderQuery): Promise<BookingStatsForProviderView>;

    findGraphDataForDashboard(query: BookingGraphStatsForProviderQuery): Promise<BookingGraphStatsForProviderView | null>;

    findStatsDataForAdminDashboard(query: BookingsStatsForAdminQuery): Promise<BookingsStatsForAdminView>;

};