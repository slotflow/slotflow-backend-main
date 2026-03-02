import { bookingQueries } from "../../infrastructure/queriesImpls";
import { GetBookingsUseCase } from "../../application/useCases/booking/getBookings.useCase";
import { ValidateJoinRoomUsecase } from "../../application/useCases/subscription/validateJoinRoom.useCase";
import { bookingRepository } from "../../infrastructure/repositoryImpls";
import { GetBookingDetailsUsecase } from "../../application/useCases/booking/getBookingDetails.useCase";

export const getBookingsUseCase = new GetBookingsUseCase(bookingQueries);

export const validateJoinRoomUsecase = new ValidateJoinRoomUsecase(bookingRepository);

export const getBookingDetailsUsecase = new GetBookingDetailsUsecase(bookingQueries);