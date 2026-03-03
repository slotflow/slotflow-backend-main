import { bookingQueries, providerServiceQueries, serviceAvailabilityQueries } from "../../infrastructure/queriesImpls";
import { GetBookingsUseCase } from "../../application/useCases/booking/getBookings.useCase";
import { ValidateJoinRoomUsecase } from "../../application/useCases/subscription/validateJoinRoom.useCase";
import { bookingRepository, paymentRepository, providerRepository, userRepository } from "../../infrastructure/repositoryImpls";
import { GetBookingDetailsUsecase } from "../../application/useCases/booking/getBookingDetails.useCase";
import { CheckBookingUseCase } from "../../application/useCases/booking/checkBooking.useCase";
import { BookingCheckoutUseCase } from "../../application/useCases/booking/bookingCheckout.useCase";
import { paymentServiceClient } from "../../infrastructure/clients";
import { CancelBookingUseCase } from "../../application/useCases/booking/cancelBooking.useCase";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/useCases/booking/updateBookingOnlineTracking.useCase";

export const getBookingsUseCase = new GetBookingsUseCase(bookingQueries);

export const validateJoinRoomUsecase = new ValidateJoinRoomUsecase(bookingRepository);

export const getBookingDetailsUsecase = new GetBookingDetailsUsecase(bookingQueries);

export const checkBookingUseCase = new CheckBookingUseCase(bookingRepository);

export const bookingCheckoutUseCase = new BookingCheckoutUseCase(providerRepository, bookingRepository, providerServiceQueries, serviceAvailabilityQueries, userRepository, paymentServiceClient);

export const cancelBookingUseCase = new CancelBookingUseCase(userRepository, bookingRepository, paymentRepository)

export const updateBookingOnlineTrakingUseCase = new UpdateBookingOnlineTrakingUseCase(bookingRepository, serviceAvailabilityQueries);
