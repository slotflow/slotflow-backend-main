import { log } from "../../../../shared/logger/logger";
import { IBookingQueries } from "../../../queries/IBooking.queries";
import { FetchDashboardTodayDataResponse } from "../../../dtos/admin.dto";
import { IUserRepository } from "../../../../domain/interfaces/repositories/IUser.repository";
import { IProviderRepository } from "../../../../domain/interfaces/repositories/IProvider.repository";


export class FetchTodaysDataUseCase {
    constructor(
        private userRepository: IUserRepository,
        private providerRepository: IProviderRepository,
        private bookingQueries: IBookingQueries,
    ) { };

    async execute(): Promise<FetchDashboardTodayDataResponse> {
        try {
            const [
                usersData,
                providersData,
                appointmentData
            ] = await Promise.all([
                this.userRepository.count(true),
                this.providerRepository.count(true),
                this.bookingQueries.findTodayStatsDataForAdminDashboard()
            ]);

            const responseData: FetchDashboardTodayDataResponse = {
                newUsers: usersData,
                newProviders: providersData,
                todaysAppointments: appointmentData.todaysAppointments,
                todaysCancelledAppointments: appointmentData.todaysCancelledAppointments,
                todaysCompletedAppointments: appointmentData.todaysCompletedAppointments
            };

            return responseData;
        } catch (error) {
            log.error("FetchTodaysDataUseCase failed", error as Error);
            throw error;
        };
    };
};