import { Types } from "mongoose";
import { Request, Response } from "express";
import { DecodedUser } from "../../express";
import { HandleError } from "../../infrastructure/error/error";
import { RequestQueryCommonZodSchema } from "../../infrastructure/zod/common.zod";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { ProviderChangeBookingAppointmentStatusZodSchema } from "../../infrastructure/zod/provider.zod";
import { ProviderChangeBookingAppointmentStatusUseCase, ProviderFetchBookingAppointmentsUseCase } from "../../application/provider-use.case/providerBooking.use-case";
import { AppointmentStatus } from "../../domain/entities/booking.entity";

const bookingRepositoryImpl = new BookingRepositoryImpl();
const providerRepositoryImpl = new ProviderRepositoryImpl();

const providerFetchBookingAppointmentsUseCase = new ProviderFetchBookingAppointmentsUseCase(providerRepositoryImpl, bookingRepositoryImpl);
const providerChangeBookingAppointmentStatusUseCase = new ProviderChangeBookingAppointmentStatusUseCase(bookingRepositoryImpl);

export class ProviderBookingController {
    constructor(
        private providerFetchBookingAppointmentsUseCase: ProviderFetchBookingAppointmentsUseCase,
        private providerChangeBookingAppointmentStatusUseCase: ProviderChangeBookingAppointmentStatusUseCase,
    ) { 
        this.fetchBookingAppointments = this.fetchBookingAppointments.bind(this);
        this.updateBookingAppointmentStatus = this.updateBookingAppointmentStatus.bind(this);
    }

    async fetchBookingAppointments(req: Request, res: Response) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const validateQueryData = RequestQueryCommonZodSchema.parse(req.query);
            const { page, limit } = validateQueryData;
            if(!providerId) throw new Error("Invalid request");
            const result = await this.providerFetchBookingAppointmentsUseCase.execute({serviceProviderId: new Types.ObjectId(providerId), page, limit});
            res.status(200).json(result);
        }catch (error){
            HandleError.handle(error,res);
        }
    }

    async updateBookingAppointmentStatus(req: Request, res: Response) {
        try {
            const validateData = ProviderChangeBookingAppointmentStatusZodSchema.parse(req.body);
            const result = await this.providerChangeBookingAppointmentStatusUseCase.execute({_id: new Types.ObjectId(validateData.appointmentId), appointmentStatus: validateData.appointmentStatus as AppointmentStatus});
            res.status(200).json(result);
        }catch (error){
            HandleError.handle(error,res);
        }
    }
}

const providerBookingController = new ProviderBookingController(providerFetchBookingAppointmentsUseCase, providerChangeBookingAppointmentStatusUseCase );
export { providerBookingController };