import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { validateJoinRoomSchema } from "../../shared/zod/common.zod";
import { providerChangeAppointmentStatusSchema } from "../../shared/zod/provider.zod";
import { providerChangeBookingAppointmentStatusUseCase, updateBookingOnlineTrakingUseCase } from ".";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/useCases/subscription/updateBookingOnlineTracking.useCase";
import { ProviderChangeBookingAppointmentStatusUseCase } from "../../application/useCases/provider/providerBooking.useCase";

class ProviderBookingController {
    constructor(
        private providerChangeBookingAppointmentStatusUseCase: ProviderChangeBookingAppointmentStatusUseCase,
        private updateBookingOnlineTrakingUseCase: UpdateBookingOnlineTrakingUseCase,
    ) {
        this.updateBookingAppointmentStatus = this.updateBookingAppointmentStatus.bind(this);
        this.providerJoinRoom = this.providerJoinRoom.bind(this);
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

};

export const providerBookingController = new ProviderBookingController(
    providerChangeBookingAppointmentStatusUseCase,
    updateBookingOnlineTrakingUseCase,
);