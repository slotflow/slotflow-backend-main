import { User } from "../../../domain/entities/user.entity";
import { roleArray } from "../../../shared/utils/constants";
import { Provider } from "../../../domain/entities/provider.entity";
import { GoogleAuthRequest } from "../../dtos/auth.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";

export class GoogleAuthUseCase {
    constructor(
        private userRepository: IUserRepository,
        private providerRepository: IProviderRepository,
    ) { }

    async execute(payload: GoogleAuthRequest): Promise<User | Provider> {
        try {
            const { email, googleId, image, name, role } = payload;
            
            if (role === roleArray[1]) {
                let user = await this.userRepository.findUserByGoogleId(googleId);

                if (!user) {
                    user = await this.userRepository.findUserByEmail(email);
                }

                if (!user) {
                    user = await this.userRepository.createUser({
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
                let provider = await this.providerRepository.findProviderByGoogleId(googleId);

                if (!provider) {
                    provider = await this.providerRepository.findProviderByEmail(email);
                }

                if (!provider) {
                    provider = await this.providerRepository.createProvider({
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