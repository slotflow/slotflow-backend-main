import { TableData } from "../../dtos/common.dto";
import { Role } from "../../../domain/enums/common.enum";
import { BadRequestError } from "../../../shared/error/appError";
import { IBookingQueries } from "../../queries/IBooking.queries";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { GetBookingsInput, GetBookingsOutput } from "../../dtos/booking.dto";

export class GetBookingsUseCase {
    constructor(
        private readonly bookingQueries: IBookingQueries,
    ) { };

    async execute(input: GetBookingsInput): Promise<TableData<GetBookingsOutput>> {
        try {
            const { serviceProviderId, userId, page, limit, online, role } = input;
            if (!role) {
                throw new BadRequestError()
            }

            if (role === Role.PROVIDER) {
                if (!serviceProviderId) {
                    throw new BadRequestError();
                }
            };

            if (role === Role.USER) {
                if (!userId) throw new BadRequestError();
            };

            return await this.bookingQueries.findAll({
                page,
                limit,
                serviceProviderId,
                userId,
                online,
                role
            });

        } catch (error: unknown) {
            throw toAppError(error, "Failed to get booking");
        };
    };
};