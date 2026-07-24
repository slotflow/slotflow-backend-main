import { kafkaProducer } from "../../infrastructure/messaging";
import { passwordHasher } from "../../infrastructure/security";
import { paymentServiceClient } from "../../infrastructure/clients";
import { cacheService, signedUrlService } from "../../infrastructure/services";
import { bookingQueries, userQueries } from "../../infrastructure/queriesImpls";
import { GetUsersUseCase } from "../../application/useCases/user/getUsers.useCase";
import { PreBoardingUseCase } from "../../application/useCases/user/preBoarding.useCase";
import { UpdatePasswordUseCase } from "../../application/useCases/user/updatePassword.useCase";
import { GetUserProfileDetailsUseCase } from "../../application/useCases/user/getUserProfile.useCase";
import { GetUserForChatSidebarUseCase } from "../../application/useCases/user/getUserFroChat.useCase";
import { ChangeUserBlockStatusUseCase } from "../../application/useCases/user/changeUserBlockStatus.useCase";
import { UpdateUserProfileInfoUseCase } from "../../application/useCases/user/updateUserProfileInfo.useCase";
import { ChangePushNotificationUseCase } from "../../application/useCases/user/changePushNotification.useCase";
import { UpdateUserProfileImageUseCase } from "../../application/useCases/user/updateUserProfileImage.useCase";
import { CheckStripeAccountStatusUseCase } from "../../application/useCases/user/checkStripeAccountStatus.useCase";
import { providerProfileRepository, referralRepository, userRepository } from "../../infrastructure/repositoryImpls";

export const updateUserProfileInfoUseCase = new UpdateUserProfileInfoUseCase(userRepository);

export const updateUserProfileImageUseCase = new UpdateUserProfileImageUseCase(userRepository, signedUrlService);

export const changePushNotificationUseCase = new ChangePushNotificationUseCase(userRepository);

export const changeUserBlockStatusUseCase = new ChangeUserBlockStatusUseCase(userRepository, kafkaProducer, cacheService);

export const getUserProfileDetailsUseCase = new GetUserProfileDetailsUseCase(userRepository, signedUrlService);

export const getUserForChatSidebarUseCase = new GetUserForChatSidebarUseCase(signedUrlService, bookingQueries);

export const getUsersUseCase = new GetUsersUseCase(userQueries);

export const preBoardingUseCase = new PreBoardingUseCase(userRepository, providerProfileRepository, referralRepository);

export const updatePasswordUseCase = new UpdatePasswordUseCase(userRepository, passwordHasher, kafkaProducer);

export const checkStripeAccountStatusUseCase = new CheckStripeAccountStatusUseCase(userRepository, paymentServiceClient);