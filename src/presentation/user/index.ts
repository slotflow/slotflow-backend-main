import { kafkaProducer } from "../../infrastructure/messaging";
import { userRepository } from "../../infrastructure/repositoryImpls";
import { cacheService, signedUrlService } from "../../infrastructure/services";
import { bookingQueries, userQueries } from "../../infrastructure/queriesImpls";
import { GetUsersUseCase } from "../../application/useCases/user/getUsers.useCase";
import { GetUserProfileDetailsUseCase } from "../../application/useCases/user/getUserProfile.useCase";
import { ChangeUserBlockStatusUseCase } from "../../application/useCases/user/changeUserBlockStatus.useCase";
import { UpdateUserProfileInfoUseCase } from "../../application/useCases/user/updateUserProfileInfo.useCase";
import { ChangePushNotificationUseCase } from "../../application/useCases/user/changePushNotification.useCase";
import { UpdateUserProfileImageUseCase } from "../../application/useCases/user/updateUserProfileImage.useCase";
import { ProviderFetchUserForChatSidebarUseCase } from "../../application/useCases/provider/providerUser.useCase";

export const updateUserProfileInfoUseCase = new UpdateUserProfileInfoUseCase(userRepository);

export const updateUserProfileImageUseCase = new UpdateUserProfileImageUseCase(userRepository, signedUrlService);

export const changePushNotificationUseCase = new ChangePushNotificationUseCase(userRepository);

export const changeUserBlockStatusUseCase = new ChangeUserBlockStatusUseCase(userRepository, kafkaProducer, cacheService);

export const getUserProfileDetailsUseCase = new GetUserProfileDetailsUseCase(userRepository, signedUrlService);

export const providerFetchUserForChatSidebarUseCase = new ProviderFetchUserForChatSidebarUseCase(signedUrlService, bookingQueries);

export const getUsersUseCase = new GetUsersUseCase(userQueries);