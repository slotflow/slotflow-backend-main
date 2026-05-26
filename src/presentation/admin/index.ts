import { bookingQueries, subscriptionQueries, userQueries } from "../../infrastructure/queriesImpls";
import { GetUserDataUseCase } from "../../application/useCases/admin/dashboard/getUsersData.useCase";
import { GetAdminGraphDataUseCase } from "../../application/useCases/admin/dashboard/getGraphData.useCase";
import { GetBookingsDataUseCase } from "../../application/useCases/admin/dashboard/getBookingsData.useCase";
import { GetProviderDataUseCase } from "../../application/useCases/admin/dashboard/getProvidersData.useCase";
import { GetSubscriptionDataUseCase } from "../../application/useCases/admin/dashboard/getSubscriptionData.useCase";

export const getUserDataUseCase = new GetUserDataUseCase(userQueries);

export const getProviderDataUseCase = new GetProviderDataUseCase(userQueries);

export const getSubscriptionDataUseCase = new GetSubscriptionDataUseCase(subscriptionQueries);

export const getBookingsDataUseCase = new GetBookingsDataUseCase(bookingQueries);

export const getAdminGraphDataUseCase = new GetAdminGraphDataUseCase();