import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { validateJoinRoomSchema } from "../../shared/zod/common.zod";
import { UserCancelBookingUseCase } from "../../application/useCases/user/userBooking.useCase";
import { UserBookingCheckoutUseCase } from "../../application/useCases/user/userBookingCheckout.useCase";
import { updateBookingOnlineTrakingUseCase, userBookingCheckoutUseCase, userCancelBookingUseCase } from ".";
import { userCancelBookingSchema, userCreateSessionIdForbookingViaStripeSchema } from "../../shared/zod/user.zod";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/useCases/subscription/updateBookingOnlineTracking.useCase";

class UserBookingController {
    constructor(
        private userCancelBookingUseCase: UserCancelBookingUseCase,
        private updateBookingOnlineTrakingUseCase: UpdateBookingOnlineTrakingUseCase,
        private userBookingCheckoutUseCase: UserBookingCheckoutUseCase
    ) {
        this.cancelBooking = this.cancelBooking.bind(this);
        this.bookingCheckout = this.bookingCheckout.bind(this);
        this.userJoinRoom = this.userJoinRoom.bind(this);
    };

    async cancelBooking(req: Request, res: Response, next: NextFunction) {
        try {
            const { bookingId, userId } = userCancelBookingSchema.parse({
                userId: (req.user as DecodedUser).userOrProviderId,
                bookingId: req.params.bookingId
            });
            await this.userCancelBookingUseCase.execute({
                userId,
                bookingId,
            });
            sendResponse(res, null, "Booking cancelled");
        } catch (error) {
            log.error("cancelBooking failed", error as Error);
            next(error);
        };
    };

    async bookingCheckout(req: Request, res: Response, next: NextFunction) {
        try {
            const { date, providerId, selectedServiceMode, slotId, userId } = userCreateSessionIdForbookingViaStripeSchema.parse({
                userId: (req.user as DecodedUser).userOrProviderId,
                ...req.body
            });
            const result = await this.userBookingCheckoutUseCase.execute({
                userId,
                providerId,
                slotId,
                selectedServiceMode,
                date: new Date(date),
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("createSessionIdForbookingViaStripe failed", error as Error);
            next(error);
        };
    };

    async userJoinRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const { joined, role, roomId, joinedTime, leftCallTime } = validateJoinRoomSchema.parse({
                roomId: req.params.roomId,
                ...req.body,
            });
            const result = await this.updateBookingOnlineTrakingUseCase.execute({
                roomId,
                joined,
                joinedTime: joinedTime ? new Date(joinedTime) : null,
                leftCallTime: leftCallTime ? new Date(leftCallTime) : null,
                role
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("userJoinRoom failed", error as Error);
            next(error);
        };
    };

}

export const userBookingController = new UserBookingController(
    userCancelBookingUseCase,
    updateBookingOnlineTrakingUseCase,
    userBookingCheckoutUseCase
);