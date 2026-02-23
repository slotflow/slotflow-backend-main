import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { validateBookingIdSchema } from "../../shared/zod/base.zod";
import { ValidateJoinRoomUsecase } from "../../application/useCases/common/validateJoinRoom.useCase";
import { FetchBookingDetailsUsecase } from "../../application/useCases/common/fetchBookingDetails.useCase";
import { FetchBookingAppointmentsUseCase } from "../../application/useCases/common/fetchAllBookings.useCase";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/useCases/common/updateBookingOnlineTracking.useCase";
import { ProviderChangeBookingAppointmentStatusUseCase } from "../../application/useCases/provider/providerBooking.useCase";
import { providerChangeAppointmentStatusSchema, providerFetchAllAppointmentsSchema, providerValidateRoomSchema } from "../../shared/zod/provider.zod";
import { fetchBookingAppointmentsUseCase, fetchBookingDetailsUsecase, providerChangeBookingAppointmentStatusUseCase, updateBookingOnlineTrakingUseCase, validateJoinRoomUsecase } from ".";
import { Role } from "../../domain/enums/common.enum";
import { validateJoinRoomSchema } from "../../shared/zod/common.zod";

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
            const { limit, page, providerId, online } = providerFetchAllAppointmentsSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId,
                ...req.query
            });
            const result = await this.fetchBookingAppointmentsUseCase.execute({
                serviceProviderId: providerId,
                page,
                limit,
                online: online ? true : false,
                role: Role.PROVIDER
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchBookingAppointments failed", error as Error);
            next(error);
        };
    };

    async updateBookingAppointmentStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { appointmentStatus, bookingId, providerId } = providerChangeAppointmentStatusSchema.parse({
                ...req.params,
                ...req.body,
                providerId: (req.user as DecodedUser).userOrProviderId
            });
            await this.providerChangeBookingAppointmentStatusUseCase.execute({ _id: bookingId, appointmentStatus, providerId });
            sendResponse(res, null, "Booking status updated successfully");
        } catch (error) {
            log.error("updateBookingAppointmentStatus failed", error as Error);
            next(error);
        };
    };

    async validateRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const { bookingId, providerId, roomId } = providerValidateRoomSchema.parse({
                bookingId: req.params.bookingId,
                roomId: req.query.roomId,
                providerId: (req.user as DecodedUser).userOrProviderId
            });
            const result = await this.validateJoinRoomUsecase.execute({
                bookingId,
                roomId,
                role: Role.PROVIDER,
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

};

export const providerBookingController = new ProviderBookingController(
    fetchBookingAppointmentsUseCase,
    providerChangeBookingAppointmentStatusUseCase,
    validateJoinRoomUsecase,
    updateBookingOnlineTrakingUseCase,
    fetchBookingDetailsUsecase
);