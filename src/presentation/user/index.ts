import { signedUrlService } from "../../infrastructure/services";
import { UserFetchAllPaymentsUseCase } from "../../application/useCases/user/userPayment.useCase";
import { FetchAllAppServicesUseCase } from "../../application/useCases/common/fetchAppServices.useCase";
import { bookingQueries, providerServiceQueries, serviceAvailabilityQueries } from "../../infrastructure/queriesImpls";
import { paymentRepository, providerRepository, serviceRepository, userRepository } from "../../infrastructure/repositoryImpls";
import { UserFetchProfileDetailsUseCase, UserUpdateProfileImageUseCase, UserUpdateProviderInfoUseCase, UserUpdatePushNotificationUseCase } from "../../application/useCases/user/userProfile.useCase";
import { UserFetchProvidersForChatSidebarUseCase, UserFetchServiceProviderServiceAvailabilityUseCase, UserFetchServiceProviderServiceDetailsUseCase, UserFetchServiceProvidersUseCase } from "../../application/useCases/user/userProvider.useCase";

// user app service controller dependency injection
export const fetchAllAppServicesUseCase = new FetchAllAppServicesUseCase(serviceRepository);

// user payment controller dependency injection
export const userFetchAllPaymentsUseCase = new UserFetchAllPaymentsUseCase(userRepository, paymentRepository);

// user profile controller dependency injection
export const userUpdateProviderInfoUseCase = new UserUpdateProviderInfoUseCase(userRepository);
export const userFetchProfileDetailsUseCase = new UserFetchProfileDetailsUseCase(userRepository);
export const userUpdateProfileImageUseCase = new UserUpdateProfileImageUseCase(userRepository, signedUrlService);
export const userUpdatePushNotificationUseCase = new UserUpdatePushNotificationUseCase(userRepository);

// user provider controller dependency injection
export const userFetchServiceProvidersUseCase = new UserFetchServiceProvidersUseCase(signedUrlService, providerServiceQueries);
export const userFetchProvidersForChatSidebarUseCase = new UserFetchProvidersForChatSidebarUseCase(signedUrlService, bookingQueries);
export const userFetchServiceProviderServiceDetailsUseCase = new UserFetchServiceProviderServiceDetailsUseCase(providerServiceQueries);
export const userFetchServiceProviderServiceAvailabilityUseCase = new UserFetchServiceProviderServiceAvailabilityUseCase(providerRepository, serviceAvailabilityQueries);
