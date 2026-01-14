import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/role.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { validateBookingIdSchema, validateJoinRoomSchema } from "../../shared/zod/common.zod";
import { UserCancelBookingUseCase } from "../../application/useCases/user/userBooking.useCase";
import { ValidateJoinRoomUsecase } from "../../application/useCases/common/validateJoinRoom.useCase";
import { FetchBookingDetailsUsecase } from "../../application/useCases/common/fetchBookingDetails.useCase";
import { FetchBookingAppointmentsUseCase } from "../../application/useCases/common/fetchAllBookings.useCase";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/useCases/common/updateBookingOnlineTracking.useCase";
import { UserAppointmentBookingViaStripeUseCase, UserSaveBookingAfterStripePaymentUseCase } from "../../application/useCases/user/userStripeBooking.useCase";
import { userCancelBookingSchema, userCreateSessionIdForbookingViaStripeSchema, userFetchAllAppointmentsSchema, userSaveBookingSchema, userValidateRoomSchema } from "../../shared/zod/user.zod";
import { fetchBookingAppointmentsUseCase, fetchBookingDetailsUsecase, updateBookingOnlineTrakingUseCase, userAppointmentBookingViaStrpieUseCase, userCancelBookingUseCase, userSaveBookingAfterStripePaymentUseCase, validateJoinRoomUsecase } from ".";

class UserBookingController {
    constructor(
        private fetchBookingAppointmentsUseCase: FetchBookingAppointmentsUseCase,
        private userCancelBookingUseCase: UserCancelBookingUseCase,
        private userAppointmentBookingViaStripeUseCase: UserAppointmentBookingViaStripeUseCase,
        private userSaveBookingAfterStripePaymentUseCase: UserSaveBookingAfterStripePaymentUseCase,
        private validateJoinRoomUsecase: ValidateJoinRoomUsecase,
        private updateBookingOnlineTrakingUseCase: UpdateBookingOnlineTrakingUseCase,
        private fetchBookingDetailsUsecase: FetchBookingDetailsUsecase
    ) {
        this.fetchBookings = this.fetchBookings.bind(this);
        this.cancelBooking = this.cancelBooking.bind(this);
        this.createSessionIdForbookingViaStripe = this.createSessionIdForbookingViaStripe.bind(this);
        this.saveBookingAfterStripePayment = this.saveBookingAfterStripePayment.bind(this);
        this.validateRoom = this.validateRoom.bind(this);
        this.userJoinRoom = this.userJoinRoom.bind(this);
        this.fetchBookingDetails = this.fetchBookingDetails.bind(this);
    };

    async fetchBookings(req: Request, res: Response, next: NextFunction) {
        try {
            const { limit, page, userId, online, raw } = userFetchAllAppointmentsSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId,
                ...req.query
            });
            const result = await this.fetchBookingAppointmentsUseCase.execute({
                userId,
                page,
                limit,
                online: online ? true : false,
                raw: raw ? true : false,
                role: Role.User,
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchBookings failed", error as Error);
            next(error);
        };
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

    async createSessionIdForbookingViaStripe(req: Request, res: Response, next: NextFunction) {
        try {
            const { date, providerId, selectedServiceMode, slotId, userId } = userCreateSessionIdForbookingViaStripeSchema.parse({
                userId: (req.user as DecodedUser).userOrProviderId,
                ...req.body
            });
            const result = await this.userAppointmentBookingViaStripeUseCase.execute({
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

    async saveBookingAfterStripePayment(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId, userId } = userSaveBookingSchema.parse({
                userId: (req.user as DecodedUser).userOrProviderId,
                ...req.body,
            });
            await this.userSaveBookingAfterStripePaymentUseCase.execute({
                userId,
                sessionId
            });
            sendResponse(res, null, "Booking saved successfully");
        } catch (error) {
            log.error("saveBookingAfterStripePayment failed", error as Error);
            next(error);
        };
    };

    async validateRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const { bookingId, roomId, userId } = userValidateRoomSchema.parse({
                bookingId: req.params.bookingId,
                roomId: req.query.roomId,
                userId: (req.user as DecodedUser).userOrProviderId
            });
            if (!userId) throw new Error("Invalid request");
            const result = await this.validateJoinRoomUsecase.execute({
                bookingId,
                roomId,
                role: Role.User,
                userOrProviderId: userId
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("validateRoom failed", error as Error);
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

    async fetchBookingDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { bookingId } = validateBookingIdSchema.parse({ bookingId: req.params.bookingId });
            const result = await this.fetchBookingDetailsUsecase.execute({ bookingId });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchBookingDetails failed", error as Error);
            next(error);
        };
    };

}

export const userBookingController = new UserBookingController(
    fetchBookingAppointmentsUseCase,
    userCancelBookingUseCase,
    userAppointmentBookingViaStrpieUseCase,
    userSaveBookingAfterStripePaymentUseCase,
    validateJoinRoomUsecase,
    updateBookingOnlineTrakingUseCase,
    fetchBookingDetailsUsecase
);