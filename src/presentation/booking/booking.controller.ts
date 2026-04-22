import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { ERROR_CODES } from "../../shared/utils/types";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { BadRequestError } from "../../shared/error/appError";
import { DecodedUser } from "../../application/dtos/common.dto";
import { GetBookingsUseCase } from "../../application/useCases/booking/getBookings.useCase";
import { CheckBookingUseCase } from "../../application/useCases/booking/checkBooking.useCase";
import { CancelBookingUseCase } from "../../application/useCases/booking/cancelBooking.useCase";
import { BookingCheckoutUseCase } from "../../application/useCases/booking/bookingCheckout.useCase";
import { GetBookingDetailsUsecase } from "../../application/useCases/booking/getBookingDetails.useCase";
import { ValidateJoinRoomUsecase } from "../../application/useCases/booking/validateJoinRoom.useCase";
import { ChangeBookingStatusUseCase } from "../../application/useCases/booking/changeBookingStatus.useCase";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/useCases/booking/updateBookingOnlineTracking.useCase";
import { bookingCheckoutViaStripeSchema, cancelBookingSchema, changeBookingStatusSchema, getBookingsSchema, validateBookingIdSchema, validateJoinRoomSchema, validateRoomIdSchema } from "../../shared/zod/booking.zod";
import { checkBookingUseCase, getBookingDetailsUsecase, getBookingsUseCase, bookingCheckoutUseCase, validateJoinRoomUsecase, cancelBookingUseCase, updateBookingOnlineTrakingUseCase, changeBookingStatusUseCase } from ".";

class BookingController {
    constructor(
        private readonly getBookingsUseCase: GetBookingsUseCase,
        private readonly validateJoinRoomUsecase: ValidateJoinRoomUsecase,
        private readonly getBookingDetailsUsecase: GetBookingDetailsUsecase,
        private readonly checkBookingUseCase: CheckBookingUseCase,
        private readonly bookingCheckoutUseCase: BookingCheckoutUseCase,
        private readonly cancelBookingUseCase: CancelBookingUseCase,
        private readonly updateBookingOnlineTrakingUseCase: UpdateBookingOnlineTrakingUseCase,
        private readonly changeBookingStatusUseCase: ChangeBookingStatusUseCase
    ) {
        this.getBookings = this.getBookings.bind(this);
        this.validateRoomId = this.validateRoomId.bind(this);
        this.getBookingDetails = this.getBookingDetails.bind(this);
        this.checkBooking = this.checkBooking.bind(this);
        this.bookingCheckout = this.bookingCheckout.bind(this);
        this.cancelBooking = this.cancelBooking.bind(this);
        this.joinOrLeftRoom = this.joinOrLeftRoom.bind(this);
        this.updateBookingAppointmentStatus = this.updateBookingAppointmentStatus.bind(this);
    }

    async getBookings(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser
            if(!user) throw new BadRequestError("User not found", ERROR_CODES.USER_NOT_FOUND);

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
            if(!user) throw new BadRequestError("User not found", ERROR_CODES.USER_NOT_FOUND);
            const { bookingId, roomId } = validateRoomIdSchema.parse({
                ...req.params,
                ...req.query
            });
            const result = await this.validateJoinRoomUsecase.execute({
                bookingId,
                roomId,
                role: user.role,
                userId: user.userOrProviderId
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("validateRoomId failed", error as Error);
            next(error);
        };
    };

    async getBookingDetails(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("getBookingDetails")
            console.log("req.params : ", req.params)
            const { bookingId } = validateBookingIdSchema.parse({ bookingId: req.params.bookingId });
            const result = await this.getBookingDetailsUsecase.execute({
                bookingId,
            });
            sendResponse(res, result);

        } catch (error) {
            log.error("getBookingDetails failed", error as Error);
            next(error);
        };
    };

    async checkBooking(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("checkBooking")
            console.log("req.user : ", req.user)
            const user = req.user as DecodedUser;
            const result = await this.checkBookingUseCase.execute({
                userId: user.userOrProviderId,
            });
            console.log("result : ", result)
            sendResponse(res, result);
        } catch (error) {
            log.error("checkBooking failed : ", error as Error);
            next(error);
        }
    }

    async bookingCheckout(req: Request, res: Response, next: NextFunction) {
        try {
            const { date, providerId, selectedServiceMode, slotId, userId } = bookingCheckoutViaStripeSchema.parse({
                userId: (req.user as DecodedUser).userOrProviderId,
                ...req.body
            });
            const result = await this.bookingCheckoutUseCase.execute({
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

    async cancelBooking(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const { bookingId, reason } = cancelBookingSchema.parse({
                bookingId: req.params.bookingId
            });
            await this.cancelBookingUseCase.execute({
                userId: user.userOrProviderId,
                bookingId,
                reason
            });
            sendResponse(res, null, "Booking cancelled");
        } catch (error) {
            log.error("cancelBooking failed", error as Error);
            next(error);
        };
    };

    async joinOrLeftRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const { joined, roomId, joinedTime, leftCallTime } = validateJoinRoomSchema.parse({
                roomId: req.params.roomId,
                ...req.body,
            });
            const result = await this.updateBookingOnlineTrakingUseCase.execute({
                roomId,
                joined,
                joinedTime: joinedTime ? new Date(joinedTime) : null,
                leftCallTime: leftCallTime ? new Date(leftCallTime) : null,
                role: user.role
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("joinOrLeftRoom failed", error as Error);
            next(error);
        };
    };

    async updateBookingAppointmentStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { appointmentStatus, bookingId, providerId } = changeBookingStatusSchema.parse({
                ...req.params,
                ...req.body,
                providerId: (req.user as DecodedUser).userOrProviderId
            });
            await this.changeBookingStatusUseCase.execute({ bookingId, appointmentStatus, providerId });
            sendResponse(res, null, "Booking status updated successfully");
        } catch (error) {
            log.error("updateBookingAppointmentStatus failed", error as Error);
            next(error);
        };
    };
}

export const bookingController = new BookingController(
    getBookingsUseCase,
    validateJoinRoomUsecase,
    getBookingDetailsUsecase,
    checkBookingUseCase,
    bookingCheckoutUseCase,
    cancelBookingUseCase,
    updateBookingOnlineTrakingUseCase,
    changeBookingStatusUseCase
)