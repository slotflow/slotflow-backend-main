import { Types } from "mongoose";
import { Request, Response } from "express";
import { DecodedUser } from "../../express";
import { HandleError } from "../../infrastructure/error/error";
import { AppointmentStatus } from "../../domain/entities/booking.entity";
import { RequestQueryCommonZodSchema, RequestQueryForBookingCommonZodSchema, ValidateObjectId } from "../../infrastructure/zod/common.zod";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ValidateJoinRoomUsecase } from "../../application/common-use.case/validateJoinRoom.use-case";
import { ProviderChangeBookingAppointmentStatusZodSchema } from "../../infrastructure/zod/provider.zod";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { ProviderChangeBookingAppointmentStatusUseCase, ProviderFetchBookingAppointmentsUseCase } from "../../application/provider-use.case/providerBooking.use-case";

const bookingRepositoryImpl = new BookingRepositoryImpl();
const providerRepositoryImpl = new ProviderRepositoryImpl();

const providerFetchBookingAppointmentsUseCase = new ProviderFetchBookingAppointmentsUseCase(providerRepositoryImpl, bookingRepositoryImpl);
const providerChangeBookingAppointmentStatusUseCase = new ProviderChangeBookingAppointmentStatusUseCase(bookingRepositoryImpl);
const validateJoinRoomUsecase = new ValidateJoinRoomUsecase(bookingRepositoryImpl)

export class ProviderBookingController {
    constructor(
        private providerFetchBookingAppointmentsUseCase: ProviderFetchBookingAppointmentsUseCase,
        private providerChangeBookingAppointmentStatusUseCase: ProviderChangeBookingAppointmentStatusUseCase,
        private validateJoinRoomUsecase: ValidateJoinRoomUsecase,
    ) {
        this.fetchBookingAppointments = this.fetchBookingAppointments.bind(this);
        this.updateBookingAppointmentStatus = this.updateBookingAppointmentStatus.bind(this);
        this.validateRoom = this.validateRoom.bind(this);
    }

    async fetchBookingAppointments(req: Request, res: Response) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const { page, limit, online, raw } = RequestQueryForBookingCommonZodSchema.parse(req.query);
            if (!providerId) throw new Error("Invalid request");
            const result = await this.providerFetchBookingAppointmentsUseCase.execute({ 
                serviceProviderId: new Types.ObjectId(providerId), 
                page, 
                limit, 
                online: online ? true : false, 
                raw: raw ? true : false 
            });
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async updateBookingAppointmentStatus(req: Request, res: Response) {
        try {
            const { id: bookingId } = ValidateObjectId(req.params.bookingId, "Booking ID");
            const validateData = ProviderChangeBookingAppointmentStatusZodSchema.parse(req.body);
            const result = await this.providerChangeBookingAppointmentStatusUseCase.execute({ _id: new Types.ObjectId(bookingId), appointmentStatus: validateData.appointmentStatus as AppointmentStatus });
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async validateRoom(req: Request, res: Response) {
        try {
            const { id: bookingId } = ValidateObjectId(req.params.bookingId, "Booking ID");
            const roomId = req.query.roomId;
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.validateJoinRoomUsecase.execute({ bookingId: new Types.ObjectId(bookingId), roomId: roomId as string, role: "PROVIDER", userOrProviderId: new Types.ObjectId(providerId) });
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

}

const providerBookingController = new ProviderBookingController(
    providerFetchBookingAppointmentsUseCase,
    providerChangeBookingAppointmentStatusUseCase,
    validateJoinRoomUsecase
);
export { providerBookingController };