import { User } from "../../domain/entities/user.entity";
import { Provider } from "../../domain/entities/provider.entity";
import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { roleArray } from "../../infrastructure/helpers/constants";
import { UpdatePasswordRequest } from "../../infrastructure/dtos/auth.dto";
import { PasswordHasher } from "../../infrastructure/security/password-hashing";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";

export class UpdatePasswordUseCase {
    constructor(private userRepositoryImpl: UserRepositoryImpl, private providerRepositoryImpl: ProviderRepositoryImpl) { }

    async execute(payload: UpdatePasswordRequest): Promise<ApiResponse> {
        try {
            const { role, verificationToken, password } = payload;

            if (!role || !verificationToken || !password) throw new Error("Invalid Request");

            const hashedPassword = await PasswordHasher.hashPassword(password);

            if (role === roleArray[1]) {
                const user = await this.userRepositoryImpl.findUserByVerificationToken(verificationToken);
                if (!user) throw new Error("User not found.");

                user.password = hashedPassword;
                await this.userRepositoryImpl.updateUser(user as User);

            } else if (role === roleArray[2]) {
                const provider = await this.providerRepositoryImpl.findProviderByVerificationToken(verificationToken);
                if (!provider) throw new Error("User not found.");

                provider.password = hashedPassword;
                await this.providerRepositoryImpl.updateProvider(provider as Provider);
            }

            return { success: true, message: "Password updated successfully." };
        } catch (error) {
            console.log("UpdatePasswordUseCase error : ", error);
            throw new Error("Failed to update password");
        }
    }
}