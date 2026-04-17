import { TableData } from "../../dtos/common.dto";
import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { IBookingQueries } from "../../queries/IBooking.queries";
import { GetBookingsInput, GetBookingsOutput } from "../../dtos/booking.dto";

export class GetBookingsUseCase {
    constructor(
        private readonly bookingQueries: IBookingQueries,
    ) { };

    async execute(input: GetBookingsInput): Promise<TableData<GetBookingsOutput>> {
        try {
            const { serviceProviderId, userId, page, limit, online, role } = input;

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
            log.error("GetBookingsUseCase failed", error as Error);
            throw error;
        };
    };
};