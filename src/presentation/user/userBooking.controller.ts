import { DecodedUser } from "../../express";
import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/role.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { UserCreateSessionIdForbookingViaStripeZodSchema } from "../../shared/zod/user.zod";
import { UserCancelBookingUseCase } from "../../application/useCases/user/userBooking.useCase";
import { ValidateJoinRoomUsecase } from "../../application/useCases/common/validateJoinRoom.useCase";
import { FetchBookingDetailsUsecase } from "../../application/useCases/common/fetchBookingDetails.useCase";
import { FetchBookingAppointmentsUseCase } from "../../application/useCases/common/fetchAllBookings.useCase";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/useCases/common/updateBookingOnlineTracking.useCase";
import { UserAppointmentBookingViaStripeUseCase, UserSaveBookingAfterStripePaymentUseCase } from "../../application/useCases/user/userStripeBooking.useCase";
import { JoinOrLeftRoomZodSchema, RequestQueryForBookingCommonZodSchema, SaveStripePaymentZodSchema, ValidateObjectId, validateRoomId } from "../../shared/zod/common.zod";
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
            const user = (req.user as DecodedUser);
            const { page, limit, online, raw } = RequestQueryForBookingCommonZodSchema.parse(req.query);
            if (!user) throw new Error("Invalid request");
            const result = await this.fetchBookingAppointmentsUseCase.execute({
                userId: user.userOrProviderId,
                page,
                limit,
                online: online ? true : false,
                raw: raw ? true : false,
                role: user.role,
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchBookings failed", error as Error);
            next(error);
        };
    };

    async cancelBooking(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { id: bookingId } = ValidateObjectId(req.params.bookingId, "Booking ID");
            if (!userId || !bookingId) throw new Error("Invalid request");
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
            const userId = (req.user as DecodedUser).userOrProviderId;
            const validateData = UserCreateSessionIdForbookingViaStripeZodSchema.parse(req.body);
            const { providerId, slotId, date, selectedServiceMode } = validateData;
            if (!userId || !providerId || !slotId || !selectedServiceMode || !date) throw new Error("Invalid request");
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
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { sessionId } = SaveStripePaymentZodSchema.parse(req.body);
            if (!userId || !sessionId) throw new Error("Invalid request");
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
            const { id: bookingId } = ValidateObjectId(req.params.bookingId, "Booking ID");
            const {roomId} = validateRoomId.parse(req.query.roomId);
            const userId = (req.user as DecodedUser).userOrProviderId;
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
            const roomId = req.params.roomId;
            const validatedData = JoinOrLeftRoomZodSchema.parse(req.body);
            const { joined, joinedTime, leftCallTime, role } = validatedData;
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
            const { id: bookingId } = ValidateObjectId(req.params.bookingId, "Booking ID");
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