import mongoose from "mongoose";
import { Role } from "../../../domain/enums/common.enum";
import { ERROR_CODES } from "../../../shared/utils/types";
import { setRoleInput, setRoleOutput } from "../../dtos/user.dto";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { ProviderProfile } from "../../../domain/entities/providerProfile.entity";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class SetRoleUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly providerProfile: IProviderProfileRepository
    ) { };

    async execute(input: setRoleInput): Promise<setRoleOutput> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { _id: userId, role } = input;
            if (!userId || !role) {
                throw new BadRequestError()
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            user.chnageSelectedRole(role);
            const updatedUser = await this.userRepository.update(user, session);
            if (!updatedUser) {
                throw new AppError(
                    "Failed to update role",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            if (role === Role.PROVIDER) {
                const providerProfile = await this.providerProfile.findByUserId(userId);
                if (!providerProfile) {
                    const newProviderProfile = ProviderProfile.create({ userId })
                    await this.providerProfile.create(newProviderProfile, session);
                }
            }

            await session.commitTransaction();
            return {
                isOnboardingCompleted: updatedUser.isOnboardingCompleted,
                hasSelectedRole: updatedUser.hasSelectedRole,
            };

        } catch (error: unknown) {
            await session.abortTransaction();
            throw toAppError(error, "Failed to set user role");
        } finally {
            session.endSession()
        }
    }
}