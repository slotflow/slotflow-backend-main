import { DecodedUser } from "../../express";
import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/role.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { ProviderChangeBookingAppointmentStatusZodSchema } from "../../shared/zod/provider.zod";
import { ValidateJoinRoomUsecase } from "../../application/useCases/common/validateJoinRoom.useCase";
import { FetchBookingDetailsUsecase } from "../../application/useCases/common/fetchBookingDetails.useCase";
import { FetchBookingAppointmentsUseCase } from "../../application/useCases/common/fetchAllBookings.useCase";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/useCases/common/updateBookingOnlineTracking.useCase";
import { ProviderChangeBookingAppointmentStatusUseCase } from "../../application/useCases/provier/providerBooking.useCase";
import { JoinOrLeftRoomZodSchema, RequestQueryForBookingCommonZodSchema, ValidateObjectId, validateRoomId } from "../../shared/zod/common.zod";
import { fetchBookingAppointmentsUseCase, fetchBookingDetailsUsecase, providerChangeBookingAppointmentStatusUseCase, updateBookingOnlineTrakingUseCase, validateJoinRoomUsecase } from ".";

class ProviderBookingController {
    constructor(
        private fetchBookingAppointmentsUseCase: FetchBookingAppointmentsUseCase,
        private providerChangeBookingAppointmentStatusUseCase: ProviderChangeBookingAppointmentStatusUseCase,
        private validateJoinRoomUsecase: ValidateJoinRoomUsecase,
        private updateBookingOnlineTrakingUseCase: UpdateBookingOnlineTrakingUseCase,
        private fetchBookingDetailsUsecase: FetchBookingDetailsUsecase,
    ) {
        this.fetchBookingAppointments = this.fetchBookingAppointments.bind(this);
        this.updateBookingAppointmentStatus = this.updateBookingAppointmentStatus.bind(this);
        this.validateRoom = this.validateRoom.bind(this);
        this.providerJoinRoom = this.providerJoinRoom.bind(this);
        this.fetchBookingDetails = this.fetchBookingDetails.bind(this);
    };

    async fetchBookingAppointments(req: Request, res: Response, next: NextFunction) {
        try {
            const provider = (req.user as DecodedUser);
            const { page, limit, online, raw } = RequestQueryForBookingCommonZodSchema.parse(req.query);
            if (!provider) throw new Error("Invalid request");
            const result = await this.fetchBookingAppointmentsUseCase.execute({
                serviceProviderId: provider.userOrProviderId,
                page,
                limit,
                online: online ? true : false,
                raw: raw ? true : false,
                role: provider.role
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchBookingAppointments failed",error as Error);
            next(error);
        };
    };

    async updateBookingAppointmentStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: bookingId } = ValidateObjectId(req.params.bookingId, "Booking ID");
            const validateData = ProviderChangeBookingAppointmentStatusZodSchema.parse(req.body);
            await this.providerChangeBookingAppointmentStatusUseCase.execute({ _id: bookingId, appointmentStatus: validateData.appointmentStatus });
            sendResponse(res, null, "Booking status updated successfully");
        } catch (error) {
            log.error("updateBookingAppointmentStatus failed",error as Error);
            next(error);
        };
    };

    async validateRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: bookingId } = ValidateObjectId(req.params.bookingId, "Booking ID");
            const { roomId } = validateRoomId.parse(req.query.roomId);
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.validateJoinRoomUsecase.execute({ 
                bookingId, 
                roomId, 
                role: Role.Provider, 
                userOrProviderId: providerId
            });
            res.status(200).json(result);
        } catch (error) {
            log.error("validateRoom failed", error as Error);
            next(error);
        };
    };

    async providerJoinRoom(req: Request, res: Response, next: NextFunction) {
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
    
    async fetchBookingDetails (req: Request, res: Response, next: NextFunction) {
        try {
            const { id: bookingId } = ValidateObjectId(req.params.bookingId, "Booking ID");
            const result = await this.fetchBookingDetailsUsecase.execute({ bookingId });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchBookingDetails failed", error as Error);
            next(error);
        };
    };

};

export const providerBookingController = new ProviderBookingController(
    fetchBookingAppointmentsUseCase,
    providerChangeBookingAppointmentStatusUseCase,
    validateJoinRoomUsecase,
    updateBookingOnlineTrakingUseCase,
    fetchBookingDetailsUsecase
);