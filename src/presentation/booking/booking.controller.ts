import { getBookingsUseCase } from ".";
import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { getBookingsSchema } from "../../shared/zod/common.zod";
import { GetBookingsUseCase } from "../../application/useCases/common/getBookings.useCase";

class BookingController {
    constructor(
        private readonly getBookingsUseCase: GetBookingsUseCase
    ) {
        this.getBookings = this.getBookings.bind(this);
    }

    async getBookings(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser

            const filter: {
                providerId?: string,
                userId?: string,
            } = {};

            if (user.role === Role.USER) {
                filter.userId = user.userOrProviderId;
            }

            if (user.role === Role.PROVIDER) {
                filter.providerId = user.userOrProviderId;
            }

            const { limit, page, providerId, online } = getBookingsSchema.parse({
                ...filter,
                ...req.query
            });
            const result = await this.getBookingsUseCase.execute({
                serviceProviderId: providerId,
                page,
                limit,
                online: online ? true : false,
                role: user.role!
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("getBookings failed", error as Error);
            next(error);
        };
    };
}

export const bookingController = new BookingController(
    getBookingsUseCase
)