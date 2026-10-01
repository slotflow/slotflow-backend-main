import { kafkaProducer } from "../../infrastructure/messaging";
import { paymentServiceClient } from "../../infrastructure/clients";
import { GetBookingsUseCase } from "../../application/useCases/booking/getBookings.useCase";
import { CheckBookingUseCase } from "../../application/useCases/booking/checkBooking.useCase";
import { CancelBookingUseCase } from "../../application/useCases/booking/cancelBooking.useCase";
import { BookingCheckoutUseCase } from "../../application/useCases/booking/bookingCheckout.useCase";
import { ValidateJoinRoomUsecase } from "../../application/useCases/booking/validateJoinRoom.useCase";
import { GetBookingDetailsUsecase } from "../../application/useCases/booking/getBookingDetails.useCase";
import { ChangeBookingStatusUseCase } from "../../application/useCases/booking/changeBookingStatus.useCase";
import { bookingQueries, providerServiceQueries, serviceAvailabilityQueries } from "../../infrastructure/queries";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/useCases/booking/updateBookingOnlineTracking.useCase";
import { addressRepository, bookingRepository, creditAccountRepository, creditTransactionRepository, providerProfileRepository, referralRepository, userRepository } from "../../infrastructure/repository";

export const getBookingsUseCase = new GetBookingsUseCase(bookingQueries);

export const validateJoinRoomUsecase = new ValidateJoinRoomUsecase(bookingRepository);

export const getBookingDetailsUsecase = new GetBookingDetailsUsecase(bookingQueries);

export const checkBookingUseCase = new CheckBookingUseCase(bookingRepository);

export const bookingCheckoutUseCase = new BookingCheckoutUseCase(bookingRepository, providerProfileRepository, providerServiceQueries, serviceAvailabilityQueries, paymentServiceClient);

export const cancelBookingUseCase = new CancelBookingUseCase(userRepository, bookingRepository, paymentServiceClient);

export const updateBookingOnlineTrakingUseCase = new UpdateBookingOnlineTrakingUseCase(bookingRepository, serviceAvailabilityQueries, userRepository, referralRepository, creditAccountRepository, creditTransactionRepository);

export const changeBookingStatusUseCase = new ChangeBookingStatusUseCase(bookingRepository, userRepository, kafkaProducer, addressRepository);