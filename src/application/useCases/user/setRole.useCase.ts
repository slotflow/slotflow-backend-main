import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { setRoleInput, setRoleOutput } from "../../dtos/user.dto";
import { ProviderProfile } from "../../../domain/entities/providerProfile.entity";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class SetRoleUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly providerProfile: IProviderProfileRepository
    ) { };

    async execute(input: setRoleInput): Promise<setRoleOutput> {
        try {
            const { _id: userId, role } = input;
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            user.chnageSelectedRole(role);
            const updatedUser = await this.userRepository.update(user);
            if (role === Role.PROVIDER) {
                const providerProfile = await this.providerProfile.findByUserId(userId);
                if (!providerProfile) {
                    const newProviderProfile = ProviderProfile.create({ userId })
                    await this.providerProfile.create(newProviderProfile);
                }
            }
            return {
                isOnboardingCompleted: updatedUser.isOnboardingCompleted,
                hasSelectedRole: updatedUser.hasSelectedRole,
            };
        } catch (error) {
            log.error("setRoleUseCase failed", error as Error);
            throw error;
        }
    }
}