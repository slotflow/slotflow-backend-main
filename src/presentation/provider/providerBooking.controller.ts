import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { roleArray } from "../../shared/utils/constants";
import { NextFunction, Request, Response } from "express";
import { RoleType } from "../../infrastructure/dtos/common.dto";
import { AesEncryption } from "../../infrastructure/services/aesEncryption.service";
import { GoogleTokenService } from "../../infrastructure/services/googleTokenService";
import { IAesEncryption } from "../../domain/interfaces/services/IAesEncryption.service";
import { IBookingRepository } from "../../domain/interfaces/repositories/IBooking.repository";
import { GoogleAuthTokenService } from "../../infrastructure/services/googleAuthToken.service";
import { ProviderChangeBookingAppointmentStatusZodSchema } from "../../shared/zod/provider.zod";
import { ICredentialRepository } from "../../domain/interfaces/repositories/ICredentialRepository";
import { UpdateEventFromGoogleCalendarService } from "../../infrastructure/services/googleCalendar";
import { IGoogleAuthTokenService } from "../../domain/interfaces/services/IGoogleAuthToken.service";
import { ValidateJoinRoomUsecase } from "../../application/useCases/common/validateJoinRoom.useCase";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { FetchBookingDetailsUsecase } from "../../application/useCases/common/fetchBookingDetails.useCase";
import { FetchBookingAppointmentsUseCase } from "../../application/useCases/common/fetchAllBookings.useCase";
import { CredentialRepositoryImpl } from "../../infrastructure/database/credential/credential.repository.impl";
import { GetCredentialUseCase, UpdateCredentialUseCase } from "../../application/useCases/common/credential.useCase";
import { IServiceAvailabilityRepository } from "../../domain/interfaces/repositories/IServiceAvailability.repository";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/useCases/common/updateBookingOnlineTracking.useCase";
import { ProviderChangeBookingAppointmentStatusUseCase } from "../../application/useCases/provier/providerBooking.useCase";
import { JoinOrLeftRoomZodSchema, RequestQueryForBookingCommonZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
import { ServiceAvailabilityRepositoryImpl } from "../../infrastructure/database/serviceAvailability/serviceAvailability.repository.impl";

const aesEncryption: IAesEncryption = new AesEncryption();
const bookingRepository: IBookingRepository = new BookingRepositoryImpl();
const credentialRepository: ICredentialRepository = new CredentialRepositoryImpl();
const serviceAvailabilityRepository: IServiceAvailabilityRepository = new ServiceAvailabilityRepositoryImpl();

const googleAuthTokenService: IGoogleAuthTokenService = new GoogleAuthTokenService();

const validateJoinRoomUsecase = new ValidateJoinRoomUsecase(bookingRepository);
const fetchBookingDetailsUsecase = new FetchBookingDetailsUsecase(bookingRepository);
const fetchBookingAppointmentsUseCase = new FetchBookingAppointmentsUseCase(bookingRepository);
const updateCredentialUseCase = new UpdateCredentialUseCase(credentialRepository, aesEncryption);
const getCredentialUseCase = new GetCredentialUseCase(credentialRepository, aesEncryption, googleAuthTokenService);

// TODO need to update with new google auth token service
const googleTokenService = new GoogleTokenService(getCredentialUseCase, updateCredentialUseCase);
const updateEventFromGoogleCalendarService = new UpdateEventFromGoogleCalendarService(googleTokenService);

const updateBookingOnlineTrakingUseCase = new UpdateBookingOnlineTrakingUseCase(bookingRepository, serviceAvailabilityRepository);
const providerChangeBookingAppointmentStatusUseCase = new ProviderChangeBookingAppointmentStatusUseCase(bookingRepository, updateEventFromGoogleCalendarService);

export class ProviderBookingController {
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
    }

    async fetchBookingAppointments(req: Request, res: Response, next: NextFunction) {
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
                role: provider.role as RoleType
            });
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchBookingAppointments error : ",error);
            next(error)
        }
    }

    async updateBookingAppointmentStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: bookingId } = ValidateObjectId(req.params.bookingId, "Booking ID");
            const validateData = ProviderChangeBookingAppointmentStatusZodSchema.parse(req.body);
            const result = await this.providerChangeBookingAppointmentStatusUseCase.execute({ _id: new Types.ObjectId(bookingId), appointmentStatus: validateData.appointmentStatus });
            res.status(200).json(result);
        } catch (error) {
            console.log("updateBookingAppointmentStatus error : ",error);
            next(error)
        }
    }

    async validateRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: bookingId } = ValidateObjectId(req.params.bookingId, "Booking ID");
            const roomId = req.query.roomId;
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.validateJoinRoomUsecase.execute({ bookingId: new Types.ObjectId(bookingId), roomId: roomId as string, role: roleArray[2], userOrProviderId: new Types.ObjectId(providerId) });
            res.status(200).json(result);
        } catch (error) {
            console.log("validateRoom erro : ", error);
            next(error)
        }
    }

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
            res.status(200).json(result);
        } catch (error) {
            console.log("userJoinRoom error : ", error);
            next(error)
        }
    }
    
    async fetchBookingDetails (req: Request, res: Response, next: NextFunction) {
        try {
            const { id: bookingId } = ValidateObjectId(req.params.bookingId, "Booking ID");
            const result = await this.fetchBookingDetailsUsecase.execute({bookingId: new Types.ObjectId(bookingId)});
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchBookingDetails error : ", error);
            next(error)
        }
    }

}

const providerBookingController = new ProviderBookingController(
    fetchBookingAppointmentsUseCase,
    providerChangeBookingAppointmentStatusUseCase,
    validateJoinRoomUsecase,
    updateBookingOnlineTrakingUseCase,
    fetchBookingDetailsUsecase
);

export { providerBookingController };