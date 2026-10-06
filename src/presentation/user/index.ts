import { kafkaProducer } from "../../infrastructure/messaging";
import { jwtService, passwordHasher } from "../../infrastructure/security";
import { cacheService, signedUrlService } from "../../infrastructure/services";
import { bookingQueries, userQueries } from "../../infrastructure/queries";
import { GetUsersUseCase } from "../../application/useCases/user/getUsers.useCase";
import { ProfileSetupUseCase } from "../../application/useCases/user/profileSetup.useCase";
import { UpdatePasswordUseCase } from "../../application/useCases/user/updatePassword.useCase";
import { GetUserProfileDetailsUseCase } from "../../application/useCases/user/getUserProfile.useCase";
import { GetUserForChatSidebarUseCase } from "../../application/useCases/user/getUserFroChat.useCase";
import { ChangeUserBlockStatusUseCase } from "../../application/useCases/user/changeUserBlockStatus.useCase";
import { UpdateUserProfileInfoUseCase } from "../../application/useCases/user/updateUserProfileInfo.useCase";
import { UpdateUserProfileImageUseCase } from "../../application/useCases/user/updateUserProfileImage.useCase";
import { providerProfileRepository, referralRepository, userRepository } from "../../infrastructure/repository";

export const updateUserProfileInfoUseCase = new UpdateUserProfileInfoUseCase(userRepository);

export const updateUserProfileImageUseCase = new UpdateUserProfileImageUseCase(userRepository, signedUrlService);

export const changeUserBlockStatusUseCase = new ChangeUserBlockStatusUseCase(userRepository, kafkaProducer, cacheService);

export const getUserProfileDetailsUseCase = new GetUserProfileDetailsUseCase(userRepository, signedUrlService);

export const getUserForChatSidebarUseCase = new GetUserForChatSidebarUseCase(signedUrlService, bookingQueries);

export const getUsersUseCase = new GetUsersUseCase(userQueries);

export const profileSetupUseCase = new ProfileSetupUseCase(userRepository, providerProfileRepository, referralRepository, jwtService);

export const updatePasswordUseCase = new UpdatePasswordUseCase(userRepository, passwordHasher, kafkaProducer);