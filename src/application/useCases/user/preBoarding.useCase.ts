import mongoose from "mongoose";
import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { PreBoardingInput, PreBoardingOutput } from "../../dtos/user.dto";
import { HearAboutUsOptionValue, Role } from "../../../domain/enums/common.enum";
import { ProviderProfile } from "../../../domain/entities/providerProfile.entity";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class PreBoardingUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly providerProfile: IProviderProfileRepository
    ) { };

    async execute(input: PreBoardingInput): Promise<PreBoardingOutput> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { _id: userId, role, referralCode, whereDidHearAboutUs } = input;
            if (!userId || !role) {
                throw new BadRequestError()
            }

            if(whereDidHearAboutUs === HearAboutUsOptionValue.REFERRAL && !referralCode) {
                throw new BadRequestError(
                    "Referral code is required when whereDidHearAboutUs is REFERRAL", 
                );
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            user.completePreBoarding({ 
                role ,
                referralCode,
                whereDidHearAboutUs
            });

            const updatedUser = await this.userRepository.update(user, session);
            if (!updatedUser) {
                throw new AppError(
                    "Failed to update role",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            let providerProfile: ProviderProfile | null = null;;
            if (role === Role.PROVIDER) {
                const existProfile = await this.providerProfile.findByUserId(userId);
                if (!existProfile) {
                    providerProfile = ProviderProfile.create({ userId })
                    await this.providerProfile.create(providerProfile, session);
                    if(!providerProfile) {
                        throw new AppError(
                            "Failed to create provider profile",
                            500,
                            true,
                            ERROR_CODES.INTERNAL_ERROR
                        );
                    }
                }
            }

            await session.commitTransaction();
            console.log("updatedUser : ", updatedUser);
            console.log(updatedUser.onboardingType);
            console.log(updatedUser.onboardingStatus);
            console.log("providerProfile : ",providerProfile);
            console.log("providerProfile.adminVerificationStatus : ", providerProfile?.adminVerificationStatus);
            return {
                onboardingType: updatedUser.onboardingType,
                onboardingStatus: updatedUser.onboardingStatus,
                adminVerificationStatus: (role === Role.PROVIDER && providerProfile) ? providerProfile.adminVerificationStatus : null
            };

        } catch (error: unknown) {
            await session.abortTransaction();
            throw toAppError(error, "Failed to preboard user");
        } finally {
            session.endSession()
        }
    }
}