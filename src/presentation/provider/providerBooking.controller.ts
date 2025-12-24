import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { AesEncryption } from "../../infrastructure/services/aesEncryption.service";
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
import { GetCredentialUseCase } from "../../application/useCases/common/credential.useCase";
import { IServiceAvailabilityRepository } from "../../domain/interfaces/repositories/IServiceAvailability.repository";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/useCases/common/updateBookingOnlineTracking.useCase";
import { ProviderChangeBookingAppointmentStatusUseCase } from "../../application/useCases/provier/providerBooking.useCase";
import { JoinOrLeftRoomZodSchema, RequestQueryForBookingCommonZodSchema, ValidateObjectId, validateRoomId } from "../../shared/zod/common.zod";
import { ServiceAvailabilityRepositoryImpl } from "../../infrastructure/database/serviceAvailability/serviceAvailability.repository.impl";
import { IBookingQueries } from "../../application/queries/IBooking.queries";
import { BookingQueriesImpl } from "../../infrastructure/queries/bookingQueries.impl";
import { sendResponse } from "../../shared/utils/response";
import { log } from "../../shared/logger/logger";
import { IServiceAvailabilityQueries } from "../../application/queries/IServiceAvailability.queries";
import { ServiceAvailabilityQueriesImpl } from "../../infrastructure/queries/serviceAvailabilityQueries.impl";
import { Role } from "../../domain/enums/role.enum";

const aesEncryption: IAesEncryption = new AesEncryption();
const bookingRepository: IBookingRepository = new BookingRepositoryImpl();
const credentialRepository: ICredentialRepository = new CredentialRepositoryImpl();
const serviceAvailabilityRepository: IServiceAvailabilityRepository = new ServiceAvailabilityRepositoryImpl();

const googleAuthTokenService: IGoogleAuthTokenService = new GoogleAuthTokenService();
const bookingQueries: IBookingQueries = new BookingQueriesImpl();
const serviceAvailabilityQueries: IServiceAvailabilityQueries = new ServiceAvailabilityQueriesImpl();

const fetchBookingAppointmentsUseCase = new FetchBookingAppointmentsUseCase(bookingQueries);

const validateJoinRoomUsecase = new ValidateJoinRoomUsecase(bookingRepository);
const fetchBookingDetailsUsecase = new FetchBookingDetailsUsecase(bookingQueries);
// const updateCredentialUseCase = new UpdateCredentialUseCase(credentialRepository, aesEncryption);
const getCredentialUseCase = new GetCredentialUseCase(credentialRepository, aesEncryption, googleAuthTokenService);

// TODO need to update with new google auth token service
// const googleTokenService = new GoogleTokenService(getCredentialUseCase, updateCredentialUseCase);
const updateEventFromGoogleCalendarService = new UpdateEventFromGoogleCalendarService(googleTokenService);

const updateBookingOnlineTrakingUseCase = new UpdateBookingOnlineTrakingUseCase(bookingRepository, serviceAvailabilityQueries);
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
            const result = await this.providerChangeBookingAppointmentStatusUseCase.execute({ _id: bookingId, appointmentStatus: validateData.appointmentStatus });
            res.status(200).json(result);
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

}

const providerBookingController = new ProviderBookingController(
    fetchBookingAppointmentsUseCase,
    providerChangeBookingAppointmentStatusUseCase,
    validateJoinRoomUsecase,
    updateBookingOnlineTrakingUseCase,
    fetchBookingDetailsUsecase
);

export { providerBookingController };