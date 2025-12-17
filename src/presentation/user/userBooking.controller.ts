import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { roleArray } from "../../shared/utils/constants";
import { NextFunction, Request, Response } from "express";
import { RoleType } from "../../application/dtos/common.dto";
import { AesEncryption } from "../../infrastructure/services/aesEncryption.service";
import { GoogleTokenService } from "../../infrastructure/services/googleTokenService";
import { IUserRepository } from "../../domain/interfaces/repositories/IUser.repository";
import { IAesEncryption } from "../../domain/interfaces/services/IAesEncryption.service";
import { UserCreateSessionIdForbookingViaStripeZodSchema } from "../../shared/zod/user.zod";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { IPaymentRepository } from "../../domain/interfaces/repositories/IPayment.repository";
import { IBookingRepository } from "../../domain/interfaces/repositories/IBooking.repository";
import { UserCancelBookingUseCase } from "../../application/useCases/user/userBooking.useCase";
import { GoogleAuthTokenService } from "../../infrastructure/services/googleAuthToken.service";
import { IProviderRepository } from "../../domain/interfaces/repositories/IProvider.repository";
import { ICredentialRepository } from "../../domain/interfaces/repositories/ICredentialRepository";
import { IGoogleAuthTokenService } from "../../domain/interfaces/services/IGoogleAuthToken.service";
import { ValidateJoinRoomUsecase } from "../../application/useCases/common/validateJoinRoom.useCase";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { FetchBookingDetailsUsecase } from "../../application/useCases/common/fetchBookingDetails.useCase";
import { FetchBookingAppointmentsUseCase } from "../../application/useCases/common/fetchAllBookings.useCase";
import { IProviderServiceRepository } from "../../domain/interfaces/repositories/IProviderService.repository";
import { CredentialRepositoryImpl } from "../../infrastructure/database/credential/credential.repository.impl";
import { GetCredentialUseCase, UpdateCredentialUseCase } from "../../application/useCases/common/credential.useCase";
import { IServiceAvailabilityRepository } from "../../domain/interfaces/repositories/IServiceAvailability.repository";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/useCases/common/updateBookingOnlineTracking.useCase";
import { ProviderServiceRepositoryImpl } from "../../infrastructure/database/providerService/providerService.repository.impl";
import { AddEventToGoogleCalendarService, UpdateEventFromGoogleCalendarService } from "../../infrastructure/services/googleCalendar";
import { ServiceAvailabilityRepositoryImpl } from "../../infrastructure/database/serviceAvailability/serviceAvailability.repository.impl";
import { JoinOrLeftRoomZodSchema, RequestQueryForBookingCommonZodSchema, SaveStripePaymentZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
import { UserAppointmentBookingViaStripeUseCase, UserSaveBookingAfterStripePaymentUseCase } from "../../application/useCases/user/userStripeBooking.useCase";

const aesEncryption: IAesEncryption = new AesEncryption();
const userRepository: IUserRepository = new UserRepositoryImpl();
const paymentRepository: IPaymentRepository = new PaymentRepositoryImpl();
const bookingRepository: IBookingRepository = new BookingRepositoryImpl();
const proviserRepository: IProviderRepository = new ProviderRepositoryImpl();
const credentialRepository: ICredentialRepository = new CredentialRepositoryImpl();
const providerServiceRepository: IProviderServiceRepository = new ProviderServiceRepositoryImpl();
const serviceAvailabilityRepository: IServiceAvailabilityRepository = new ServiceAvailabilityRepositoryImpl();

const googleAuthTokenService: IGoogleAuthTokenService = new GoogleAuthTokenService();

const validateJoinRoomUsecase = new ValidateJoinRoomUsecase(bookingRepository)
const fetchBookingDetailsUsecase = new FetchBookingDetailsUsecase(bookingRepository);
const getCredentialUseCase = new GetCredentialUseCase(credentialRepository, aesEncryption, googleAuthTokenService);
const updateCredentialUseCase = new UpdateCredentialUseCase(credentialRepository, aesEncryption);
const googleTokenService = new GoogleTokenService(getCredentialUseCase, updateCredentialUseCase);
const addEventToGoogleCalendarService = new AddEventToGoogleCalendarService(googleTokenService);
const fetchBookingAppointmentsUseCase = new FetchBookingAppointmentsUseCase(bookingRepository);
const updateEventFromGoogleCalendarService = new UpdateEventFromGoogleCalendarService(googleTokenService);
const updateBookingOnlineTrakingUseCase = new UpdateBookingOnlineTrakingUseCase(bookingRepository, serviceAvailabilityRepository);
const userCancelBookingUseCase = new UserCancelBookingUseCase(userRepository, bookingRepository, paymentRepository, updateEventFromGoogleCalendarService);
const userAppointmentBookingViaStrpieUseCase = new UserAppointmentBookingViaStripeUseCase(proviserRepository, providerServiceRepository, serviceAvailabilityRepository, bookingRepository);
const userSaveBookingAfterStripePaymentUseCase = new UserSaveBookingAfterStripePaymentUseCase(userRepository, paymentRepository, bookingRepository, serviceAvailabilityRepository, addEventToGoogleCalendarService);

export class UserBookingController {
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
    }

    async fetchBookings(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req.user as DecodedUser);
            const { page, limit, online, raw } = RequestQueryForBookingCommonZodSchema.parse(req.query);
            if (!user) throw new Error("Invalid request");
            const result = await this.fetchBookingAppointmentsUseCase.execute({
                userId: new Types.ObjectId(user.userOrProviderId),
                page,
                limit,
                online: online ? true : false,
                raw: raw ? true : false,
                role: user.role as RoleType,
            });
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchBookings error : ",error);
            next(error)
        }
    }

    async cancelBooking(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { id: bookingId } = ValidateObjectId(req.params.bookingId, "Booking ID");
            if (!userId || !bookingId) throw new Error("Invalid request");
            const result = await this.userCancelBookingUseCase.execute({ userId: new Types.ObjectId(userId), bookingId: new Types.ObjectId(bookingId) });
            res.status(200).json(result);
        } catch (error) {
            console.log("cancelBooking error : ",error);
            next(error)
        }
    }

    async createSessionIdForbookingViaStripe(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const validateData = UserCreateSessionIdForbookingViaStripeZodSchema.parse(req.body);
            const { providerId, slotId, date, selectedServiceMode } = validateData;
            if (!userId || !providerId || !slotId || !selectedServiceMode || !date) throw new Error("Invalid request");
            const result = await this.userAppointmentBookingViaStripeUseCase.execute({
                userId: new Types.ObjectId(userId),
                providerId: new Types.ObjectId(providerId),
                slotId: new Types.ObjectId(slotId),
                selectedServiceMode,
                date: new Date(date),
            });
            res.status(200).json(result);
        } catch (error) {
            console.log("createSessionIdForbookingViaStripe error : ",error);
            next(error)
        }
    }

    async saveBookingAfterStripePayment(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { sessionId } = SaveStripePaymentZodSchema.parse(req.body);
            if (!userId || !sessionId) throw new Error("Invalid request");
            const result = await this.userSaveBookingAfterStripePaymentUseCase.execute({ userId: new Types.ObjectId(userId), sessionId });
            res.status(200).json(result);
        } catch (error) {
            console.log("saveBookingAfterStripePayment error : ",error);
            next(error)
        }
    }

    async validateRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: bookingId } = ValidateObjectId(req.params.bookingId, "Booking ID");
            const roomId = req.query.roomId;
            const userId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.validateJoinRoomUsecase.execute({ bookingId: new Types.ObjectId(bookingId), roomId: roomId as string, role: roleArray[1], userOrProviderId: new Types.ObjectId(userId) });
            res.status(200).json(result);
        } catch (error) {
            console.log("validateRoom error : ", error);
            next(error)
        }
    }

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
            res.status(200).json(result);
        } catch (error) {
            console.log("userJoinRoom error : ",error);
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

const userBookingController = new UserBookingController(
    fetchBookingAppointmentsUseCase,
    userCancelBookingUseCase,
    userAppointmentBookingViaStrpieUseCase,
    userSaveBookingAfterStripePaymentUseCase,
    validateJoinRoomUsecase,
    updateBookingOnlineTrakingUseCase,
    fetchBookingDetailsUsecase
);

export { userBookingController };