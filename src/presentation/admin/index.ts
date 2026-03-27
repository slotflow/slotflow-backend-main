import { providerRepository, userRepository } from "../../infrastructure/repositoryImpls";
import { FetchUserDataUseCase } from "../../application/useCases/admin/dashboard/fetchUsersData.useCase";
import { FetchGraphDataUseCase } from "../../application/useCases/admin/dashboard/fetchGraphData.useCase";
import { FetchBookingsDataUseCase } from "../../application/useCases/admin/dashboard/fetchBookingsData.useCase";
import { FetchProviderDataUseCase } from "../../application/useCases/admin/dashboard/fetchProvidersData.useCase";
import { bookingQueries, providerQueries, subscriptionQueries, userQueries } from "../../infrastructure/queriesImpls";
import { FetchSubscriptionDataUseCase } from "../../application/useCases/admin/dashboard/fetchSubscriptionData.useCase";

export const fetchUserDataUseCase = new FetchUserDataUseCase(userQueries);

export const fetchProviderDataUseCase = new FetchProviderDataUseCase(providerQueries);

export const fetchSubscriptionDataUseCase = new FetchSubscriptionDataUseCase(subscriptionQueries);

export const fetchBookingsDataUseCase = new FetchBookingsDataUseCase(bookingQueries);

export const fetchGraphDataUseCase = new FetchGraphDataUseCase();