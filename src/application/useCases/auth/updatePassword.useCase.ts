import { ApiResponse } from "../../dtos/common.dto";
import { User } from "../../../domain/entities/user.entity";
import { roleArray } from "../../../shared/utils/constants";
import { UpdatePasswordRequest } from "../../dtos/auth.dto";
import { PasswordHasher } from "../../../infrastructure/security/password-hashing";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";

export class UpdatePasswordUseCase {
    constructor(
        private userRepository: IUserRepository, 
        private providerRepository: IProviderRepository
    ) { }

    async execute(payload: UpdatePasswordRequest): Promise<ApiResponse> {
        try {
            const { role, verificationToken, password } = payload;

            if (!role || !verificationToken || !password) throw new Error("Invalid Request");

            const hashedPassword = await PasswordHasher.hashPassword(password);

            if (role === roleArray[1]) {
                const user = await this.userRepository.findUserByVerificationToken(verificationToken);
                if (!user) throw new Error("User not found.");

                user.password = hashedPassword;
                await this.userRepository.updateUser(user as User);

            } else if (role === roleArray[2]) {
                const provider = await this.providerRepository.findByVerificationToken(verificationToken);
                if (!provider) throw new Error("User not found.");

                provider.changePassword({ password: hashedPassword });
                await this.providerRepository.update(provider);
            }

            return { success: true, message: "Password updated successfully." };
        } catch (error) {
            console.log("UpdatePasswordUseCase error : ", error);
            throw new Error("Failed to update password");
        }
    }
}