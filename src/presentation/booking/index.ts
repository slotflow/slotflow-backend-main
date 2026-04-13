import { kafkaProducer } from "../../infrastructure/messaging";
import { googleTokenService } from "../../infrastructure/services";
import { paymentServiceClient } from "../../infrastructure/clients";
import { bookingRepository, providerProfileRepository, userRepository } from "../../infrastructure/repositoryImpls";
import { GetBookingsUseCase } from "../../application/useCases/booking/getBookings.useCase";
import { CheckBookingUseCase } from "../../application/useCases/booking/checkBooking.useCase";
import { CancelBookingUseCase } from "../../application/useCases/booking/cancelBooking.useCase";
import { BookingCheckoutUseCase } from "../../application/useCases/booking/bookingCheckout.useCase";
import { GetBookingDetailsUsecase } from "../../application/useCases/booking/getBookingDetails.useCase";
import { ValidateJoinRoomUsecase } from "../../application/useCases/booking/validateJoinRoom.useCase";
import { ChangeBookingStatusUseCase } from "../../application/useCases/booking/changeBookingStatus.useCase";
import { bookingQueries, providerServiceQueries, serviceAvailabilityQueries } from "../../infrastructure/queriesImpls";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/useCases/booking/updateBookingOnlineTracking.useCase";

export const getBookingsUseCase = new GetBookingsUseCase(bookingQueries);

export const validateJoinRoomUsecase = new ValidateJoinRoomUsecase(bookingRepository);

export const getBookingDetailsUsecase = new GetBookingDetailsUsecase(bookingQueries);

export const checkBookingUseCase = new CheckBookingUseCase(bookingRepository);

export const bookingCheckoutUseCase = new BookingCheckoutUseCase(bookingRepository, providerProfileRepository, providerServiceQueries, serviceAvailabilityQueries, userRepository, paymentServiceClient);

export const cancelBookingUseCase = new CancelBookingUseCase(userRepository, bookingRepository);

export const updateBookingOnlineTrakingUseCase = new UpdateBookingOnlineTrakingUseCase(bookingRepository, serviceAvailabilityQueries);

export const changeBookingStatusUseCase = new ChangeBookingStatusUseCase(bookingRepository, userRepository, googleTokenService, kafkaProducer);