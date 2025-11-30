import { User } from "../../domain/entities/user.entity";
import { Provider } from "../../domain/entities/provider.entity";
import { roleArray } from "../../utils/constants";
import { GoogleAuthRequest } from "../../infrastructure/dtos/auth.dto";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";

export class GoogleAuthUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
        private providerRepositoryImpl: ProviderRepositoryImpl,
    ) { }

    async execute(payload: GoogleAuthRequest): Promise<User | Provider> {
        try {
            const { email, googleId, image, name, role } = payload;
            
            if (role === roleArray[1]) {
                let user = await this.userRepositoryImpl.findUserByGoogleId(googleId);

                if (!user) {
                    user = await this.userRepositoryImpl.findUserByEmail(email);
                }

                if (!user) {
                    user = await this.userRepositoryImpl.createUser({
                        username: name,
                        email: email,
                        googleId: googleId,
                        profileImage: image ?? "",
                        isEmailVerified: true,
                        googleConnected: true,
                    })
                }

                return user as User;
            }

            if (role === roleArray[2]) {
                let provider = await this.providerRepositoryImpl.findProviderByGoogleId(googleId);

                if (!provider) {
                    provider = await this.providerRepositoryImpl.findProviderByEmail(email);
                }

                if (!provider) {
                    provider = await this.providerRepositoryImpl.createProvider({
                        username: name,
                        email: email,
                        googleId: googleId,
                        profileImage: image ?? "",
                        isEmailVerified: true,
                        googleConnected: true,
                    })
                }
                return provider as Provider;
            }

            throw new Error("Invalid role");
        } catch (error) {
            console.log("GoogleAuthUseCase error : ", error);
            throw new Error("Google Auth failed");
        }
    }
}