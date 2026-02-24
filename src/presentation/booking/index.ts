import { bookingQueries } from "../../infrastructure/queriesImpls";
import { GetBookingsUseCase } from "../../application/useCases/common/getBookings.useCase";

export const getBookingsUseCase = new GetBookingsUseCase(bookingQueries);