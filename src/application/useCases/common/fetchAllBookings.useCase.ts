import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { IBookingQueries } from "../../queries/IBooking.queries";
import { FetchBookingsRequest, FetchBookingsResponse, FetchOnlineBookingsForProviderResponse, FetchOnlineBookingsForUserResponse, TableData } from "../../dtos/common.dto";

export class FetchBookingAppointmentsUseCase {
    constructor(
        private bookingQueries: IBookingQueries,
    ) { };

    async execute(payload: FetchBookingsRequest): Promise<TableData<FetchBookingsResponse | FetchOnlineBookingsForProviderResponse | FetchOnlineBookingsForUserResponse>> {
        try {
            const { serviceProviderId, userId, page, limit, online, role } = payload;
            
            if (role === Role.PROVIDER) {
                if (!serviceProviderId) throw new Error("Invalid request");
            };
            if (role === Role.USER) {
                if (!userId) throw new Error("Invalid request");
            };

            const result = await this.bookingQueries.findAll({
                page,
                limit,
                serviceProviderId,
                userId,
                online,
                role
            });

            const { data: bookings, currentPage, totalCount, totalPages } = result;

            return {
                data: bookings,
                totalPages,
                currentPage,
                totalCount,
            };
        } catch (error) {
            log.error("FetchBookingAppointmentsUseCase failed", error as Error);
            throw error;
        };
    };
};