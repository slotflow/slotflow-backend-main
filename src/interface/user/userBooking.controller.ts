import { Types } from "mongoose";
import { Request, Response } from "express";
import { DecodedUser } from "../../express";
import { Role } from "../../infrastructure/dtos/common.dto";
import { HandleError } from "../../infrastructure/error/error";
import { AesEncryption } from "../../infrastructure/services/aesEncryption";
import { GoogleTokenService } from "../../infrastructure/services/googleTokenService";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { UserCancelBookingUseCase } from "../../application/user-use.case/userBooking.use-case";
import { UserCreateSessionIdForbookingViaStripeZodSchema } from "../../infrastructure/zod/user.zod";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ValidateJoinRoomUsecase } from "../../application/common-use.case/validateJoinRoom.use-case";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { FetchBookingAppointmentsUseCase } from "../../application/common-use.case/fetchAllBookings.use-case";
import { CredentialRepositoryImpl } from "../../infrastructure/database/credential/credential.repository.impl";
import { GetCredentialUseCase, UpdateCredentialUseCase } from "../../application/common-use.case/credential.use-case";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/common-use.case/updateBookingOnlineTracking.use-case";
import { ProviderServiceRepositoryImpl } from "../../infrastructure/database/providerService/providerService.repository.impl";
import { AddEventToGoogleCalendarService, UpdateEventFromGoogleCalendarService } from "../../infrastructure/services/googleCalendar";
import { ServiceAvailabilityRepositoryImpl } from "../../infrastructure/database/serviceAvailability/serviceAvailability.repository.impl";
import { JoinOrLeftRoomZodSchema, RequestQueryForBookingCommonZodSchema, SaveStripePaymentZodSchema, ValidateObjectId } from "../../infrastructure/zod/common.zod";
import { UserAppointmentBookingViaStripeUseCase, UserSaveBookingAfterStripePaymentUseCase } from "../../application/user-use.case/userStripeBooking.use-case";

const aesEncryption = new AesEncryption();
const userRepositoryImpl = new UserRepositoryImpl();
const paymentRepositoryImpl = new PaymentRepositoryImpl();
const bookingRepositoryImpl = new BookingRepositoryImpl();
const proviserRepositoryImpl = new ProviderRepositoryImpl();
const credentialRepositoryImpl = new CredentialRepositoryImpl();
const providerServiceRepositoryImpl = new ProviderServiceRepositoryImpl();
const serviceAvailabilityRepositoryImpl = new ServiceAvailabilityRepositoryImpl();

const validateJoinRoomUsecase = new ValidateJoinRoomUsecase(bookingRepositoryImpl)
const getCredentialUseCase = new GetCredentialUseCase(credentialRepositoryImpl, aesEncryption);
const updateCredentialUseCase = new UpdateCredentialUseCase(credentialRepositoryImpl, aesEncryption);
const googleTokenService = new GoogleTokenService(getCredentialUseCase, updateCredentialUseCase);
const updateEventFromGoogleCalendarService = new UpdateEventFromGoogleCalendarService(googleTokenService);
const addEventToGoogleCalendarService = new AddEventToGoogleCalendarService(googleTokenService);
const fetchBookingAppointmentsUseCase = new FetchBookingAppointmentsUseCase(bookingRepositoryImpl);
const userCancelBookingUseCase = new UserCancelBookingUseCase(userRepositoryImpl, bookingRepositoryImpl, paymentRepositoryImpl, updateEventFromGoogleCalendarService);
const userAppointmentBookingViaStrpieUseCase = new UserAppointmentBookingViaStripeUseCase(proviserRepositoryImpl, providerServiceRepositoryImpl, serviceAvailabilityRepositoryImpl, bookingRepositoryImpl);
const userSaveBookingAfterStripePaymentUseCase = new UserSaveBookingAfterStripePaymentUseCase(userRepositoryImpl, paymentRepositoryImpl, bookingRepositoryImpl, serviceAvailabilityRepositoryImpl, addEventToGoogleCalendarService);
const updateBookingOnlineTrakingUseCase = new UpdateBookingOnlineTrakingUseCase(bookingRepositoryImpl);

export class UserBookingController {
    constructor(
        private fetchBookingAppointmentsUseCase: FetchBookingAppointmentsUseCase,
        private userCancelBookingUseCase: UserCancelBookingUseCase,
        private userAppointmentBookingViaStripeUseCase: UserAppointmentBookingViaStripeUseCase,
        private userSaveBookingAfterStripePaymentUseCase: UserSaveBookingAfterStripePaymentUseCase,
        private validateJoinRoomUsecase: ValidateJoinRoomUsecase,
        private updateBookingOnlineTrakingUseCase: UpdateBookingOnlineTrakingUseCase,
    ) {
        this.fetchBookings = this.fetchBookings.bind(this);
        this.cancelBooking = this.cancelBooking.bind(this);
        this.createSessionIdForbookingViaStripe = this.createSessionIdForbookingViaStripe.bind(this);
        this.saveBookingAfterStripePayment = this.saveBookingAfterStripePayment.bind(this);
        this.validateRoom = this.validateRoom.bind(this);
        this.userJoinRoom = this.userJoinRoom.bind(this);
    }

    async fetchBookings(req: Request, res: Response) {
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
                role: user.role as Role.user
            });
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async cancelBooking(req: Request, res: Response) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { id: bookingId } = ValidateObjectId(req.params.bookingId, "Booking ID");
            if (!userId || !bookingId) throw new Error("Invalid request");
            const result = await this.userCancelBookingUseCase.execute({ userId: new Types.ObjectId(userId), bookingId: new Types.ObjectId(bookingId) });
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async createSessionIdForbookingViaStripe(req: Request, res: Response) {
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
            HandleError.handle(error, res);
        }
    }

    async saveBookingAfterStripePayment(req: Request, res: Response) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { sessionId } = SaveStripePaymentZodSchema.parse(req.body);
            if (!userId || !sessionId) throw new Error("Invalid request");
            const result = await this.userSaveBookingAfterStripePaymentUseCase.execute({ userId: new Types.ObjectId(userId), sessionId });
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async validateRoom(req: Request, res: Response) {
        try {
            console.log("Validating room id");
            const { id: bookingId } = ValidateObjectId(req.params.bookingId, "Booking ID");
            const roomId = req.query.roomId;
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.validateJoinRoomUsecase.execute({ bookingId: new Types.ObjectId(bookingId), roomId: roomId as string, role: Role.user, userOrProviderId: new Types.ObjectId(providerId) });
            console.log("result : ",result);
            res.status(200).json(result);
        } catch (error) {
            console.log("validateRoom error : ", error);
            HandleError.handle(error, res);
        }
    }

    async userJoinRoom(req: Request, res: Response) {
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

const userBookingController = new UserBookingController(
    fetchBookingAppointmentsUseCase,
    userCancelBookingUseCase,
    userAppointmentBookingViaStrpieUseCase,
    userSaveBookingAfterStripePaymentUseCase,
    validateJoinRoomUsecase,
    updateBookingOnlineTrakingUseCase
);

export { userBookingController };