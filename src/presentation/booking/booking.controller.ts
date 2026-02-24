import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { getBookingsUseCase, validateJoinRoomUsecase } from ".";
import { DecodedUser } from "../../application/dtos/common.dto";
import { getBookingsSchema, validateRoomIdSchema } from "../../shared/zod/common.zod";
import { GetBookingsUseCase } from "../../application/useCases/common/getBookings.useCase";
import { ValidateJoinRoomUsecase } from "../../application/useCases/common/validateJoinRoom.useCase";

class BookingController {
    constructor(
        private readonly getBookingsUseCase: GetBookingsUseCase,
        private readonly validateJoinRoomUsecase: ValidateJoinRoomUsecase
    ) {
        this.getBookings = this.getBookings.bind(this);
        this.validateRoomId = this.validateRoomId.bind(this);
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

            const { limit, page, online } = getBookingsSchema.parse({
                ...filter,
                ...req.query
            });
            const result = await this.getBookingsUseCase.execute({
                serviceProviderId: filter.providerId,
                userId: filter.userId,
                page,
                limit,
                online: online ? true : false,
                role: user.role
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("getBookings failed", error as Error);
            next(error);
        };
    };

    async validateRoomId(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const { bookingId, roomId } = validateRoomIdSchema.parse({
                ...req.params,
                ...req.query
            });
            const result = await this.validateJoinRoomUsecase.execute({
                bookingId,
                roomId,
                role: user.role,
                userOrProviderId: user.userOrProviderId
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("validateRoomId failed", error as Error);
            next(error);
        };
    };
}

export const bookingController = new BookingController(
    getBookingsUseCase,
    validateJoinRoomUsecase
)