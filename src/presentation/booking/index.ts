import { bookingQueries } from "../../infrastructure/queriesImpls";
import { GetBookingsUseCase } from "../../application/useCases/common/getBookings.useCase";
import { ValidateJoinRoomUsecase } from "../../application/useCases/common/validateJoinRoom.useCase";
import { bookingRepository } from "../../infrastructure/repositoryImpls";

export const getBookingsUseCase = new GetBookingsUseCase(bookingQueries);

export const validateJoinRoomUsecase = new ValidateJoinRoomUsecase(bookingRepository)