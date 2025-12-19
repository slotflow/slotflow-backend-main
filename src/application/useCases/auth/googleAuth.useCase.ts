import { GoogleAuthRequest } from "../../dtos/auth.dto";
import { User } from "../../../domain/entities/user.entity";
import { roleArray } from "../../../shared/utils/constants";
import { Provider } from "../../../domain/entities/provider.entity";
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
                let user = await this.userRepository.findByGoogleId(googleId);

                if (!user) {
                    user = await this.userRepository.findByEmail(email);
                }

                if (!user) {
                    user = User.createGoogle({
                        _id: "",
                        username: name,
                        email,
                        googleId,
                        isEmailVerified: true,
                        profileImage: image ?? "",
                    });
                    await this.userRepository.create(user);
                }

                return user;
            }

            if (role === roleArray[2]) {
                let provider = await this.providerRepository.findByGoogleId(googleId);

                if (!provider) {
                    provider = await this.providerRepository.findByEmail(email);
                }

                if (!provider) {
                    provider = Provider.createGoogle({
                        _id: "",
                        username: name,
                        email,
                        googleId,
                        isEmailVerified: true,
                        profileImage: image ?? "",
                    });
                    await this.providerRepository.create(provider);
                }
                return provider;
            }

            throw new Error("Invalid role");
        } catch (error) {
            console.log("GoogleAuthUseCase error : ", error);
            throw new Error("Google Auth failed");
        }
    }
}