import { Types } from "mongoose";
import { Request, Response } from "express";
import { DecodedUser } from "../../express";
import { Role } from "../../infrastructure/dtos/common.dto";
import { HandleError } from "../../infrastructure/error/error";
import { AppointmentStatus } from "../../domain/entities/booking.entity";
import { AesEncryption } from "../../infrastructure/services/aesEncryption";
import { GoogleTokenService } from "../../infrastructure/services/googleTokenService";
import { UpdateEventFromGoogleCalendarService } from "../../infrastructure/services/googleCalendar";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ValidateJoinRoomUsecase } from "../../application/common-use.case/validateJoinRoom.use-case";
import { ProviderChangeBookingAppointmentStatusZodSchema } from "../../infrastructure/zod/provider.zod";
import { FetchBookingAppointmentsUseCase } from "../../application/common-use.case/fetchAllBookings.use-case";
import { CredentialRepositoryImpl } from "../../infrastructure/database/credential/credential.repository.impl";
import { GetCredentialUseCase, UpdateCredentialUseCase } from "../../application/common-use.case/credential.use-case";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/common-use.case/updateBookingOnlineTracking.use-case";
import { ProviderChangeBookingAppointmentStatusUseCase } from "../../application/provider-use.case/providerBooking.use-case";
import { JoinOrLeftRoomZodSchema, RequestQueryForBookingCommonZodSchema, ValidateObjectId } from "../../infrastructure/zod/common.zod";
import { ServiceAvailabilityRepositoryImpl } from "../../infrastructure/database/serviceAvailability/serviceAvailability.repository.impl";

const aesEncryption = new AesEncryption();
const bookingRepositoryImpl = new BookingRepositoryImpl();
const credentialRepositoryImpl = new CredentialRepositoryImpl();
const serviceAvailabilityRepositoryImpl = new ServiceAvailabilityRepositoryImpl()

const fetchBookingAppointmentsUseCase = new FetchBookingAppointmentsUseCase(bookingRepositoryImpl);
const getCredentialUseCase = new GetCredentialUseCase(credentialRepositoryImpl, aesEncryption);
const updateCredentialUseCase = new UpdateCredentialUseCase(credentialRepositoryImpl, aesEncryption);
const googleTokenService = new GoogleTokenService(getCredentialUseCase, updateCredentialUseCase);
const updateEventFromGoogleCalendarService = new UpdateEventFromGoogleCalendarService(googleTokenService);
const providerChangeBookingAppointmentStatusUseCase = new ProviderChangeBookingAppointmentStatusUseCase(bookingRepositoryImpl, updateEventFromGoogleCalendarService);
const validateJoinRoomUsecase = new ValidateJoinRoomUsecase(bookingRepositoryImpl);
const updateBookingOnlineTrakingUseCase = new UpdateBookingOnlineTrakingUseCase(bookingRepositoryImpl, serviceAvailabilityRepositoryImpl);

export class ProviderBookingController {
    constructor(
        private fetchBookingAppointmentsUseCase: FetchBookingAppointmentsUseCase,
        private providerChangeBookingAppointmentStatusUseCase: ProviderChangeBookingAppointmentStatusUseCase,
        private validateJoinRoomUsecase: ValidateJoinRoomUsecase,
        private updateBookingOnlineTrakingUseCase: UpdateBookingOnlineTrakingUseCase,
    ) {
        this.fetchBookingAppointments = this.fetchBookingAppointments.bind(this);
        this.updateBookingAppointmentStatus = this.updateBookingAppointmentStatus.bind(this);
        this.validateRoom = this.validateRoom.bind(this);
        this.providerJoinRoom = this.providerJoinRoom.bind(this);
    }

    async fetchBookingAppointments(req: Request, res: Response) {
        try {
            const provider = (req.user as DecodedUser);
            const { page, limit, online, raw } = RequestQueryForBookingCommonZodSchema.parse(req.query);
            if (!provider) throw new Error("Invalid request");
            const result = await this.fetchBookingAppointmentsUseCase.execute({
                serviceProviderId: new Types.ObjectId(provider.userOrProviderId),
                page,
                limit,
                online: online ? true : false,
                raw: raw ? true : false,
                role: provider.role as Role
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
            res.status(204).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async validateRoom(req: Request, res: Response) {
        try {
            const { id: bookingId } = ValidateObjectId(req.params.bookingId, "Booking ID");
            const roomId = req.query.roomId;
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.validateJoinRoomUsecase.execute({ bookingId: new Types.ObjectId(bookingId), roomId: roomId as string, role: Role.provider, userOrProviderId: new Types.ObjectId(providerId) });
            res.status(200).json(result);
        } catch (error) {
            console.log("validateRoom erro : ",error);
            HandleError.handle(error, res);
        }
    }

    async providerJoinRoom(req: Request, res: Response) {
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
                res.status(200).json(result);
            } catch (error) {
                console.log("userJoinRoom error : ",error);
                HandleError.handle(error, res);
            }
        }

}

const providerBookingController = new ProviderBookingController(
    fetchBookingAppointmentsUseCase,
    providerChangeBookingAppointmentStatusUseCase,
    validateJoinRoomUsecase,
    updateBookingOnlineTrakingUseCase
);
export { providerBookingController };