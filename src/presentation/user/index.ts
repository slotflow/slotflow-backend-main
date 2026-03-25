import { signedUrlService } from "../../infrastructure/services";
import { userRepository } from "../../infrastructure/repositoryImpls";
import { bookingQueries, providerServiceQueries } from "../../infrastructure/queriesImpls";
import { UserFetchProvidersForChatSidebarUseCase, UserFetchServiceProviderServiceDetailsUseCase, UserFetchServiceProvidersUseCase } from "../../application/useCases/user/userProvider.useCase";
import { UserFetchProfileDetailsUseCase, UserUpdateProfileImageUseCase, UserUpdateProviderInfoUseCase, UserUpdatePushNotificationUseCase } from "../../application/useCases/user/userProfile.useCase";

// user profile controller dependency injection
export const userUpdateProviderInfoUseCase = new UserUpdateProviderInfoUseCase(userRepository);
export const userFetchProfileDetailsUseCase = new UserFetchProfileDetailsUseCase(userRepository);
export const userUpdateProfileImageUseCase = new UserUpdateProfileImageUseCase(userRepository, signedUrlService);
export const userUpdatePushNotificationUseCase = new UserUpdatePushNotificationUseCase(userRepository);

// user provider controller dependency injection
export const userFetchServiceProvidersUseCase = new UserFetchServiceProvidersUseCase(signedUrlService, providerServiceQueries);
export const userFetchProvidersForChatSidebarUseCase = new UserFetchProvidersForChatSidebarUseCase(signedUrlService, bookingQueries);
export const userFetchServiceProviderServiceDetailsUseCase = new UserFetchServiceProviderServiceDetailsUseCase(providerServiceQueries);
