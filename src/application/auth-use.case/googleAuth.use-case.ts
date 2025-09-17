import { User } from "../../domain/entities/user.entity";
import { Provider } from "../../domain/entities/provider.entity";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";

export class GoogleAuthUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
        private providerRepositoryImpl: ProviderRepositoryImpl,
    ) { }

    async execute(profile: {
        googleId: string;
        email: string;
        name: string;
        role: "USER" | "PROVIDER";
        image: string | null;
    }): Promise<User | Provider> {
        try {

            if (profile.role === "USER") {
                let user = await this.userRepositoryImpl.findUserByGoogleId(profile.googleId);

                if (!user) {
                    user = await this.userRepositoryImpl.findUserByEmail(profile.email);
                }

                if (!user) {
                    user = await this.userRepositoryImpl.createUser({
                        username: profile.name,
                        email: profile.email,
                        googleId: profile.googleId,
                        profileImage: profile.image ?? "",
                        isEmailVerified: true,
                        googleConnected: true,
                    })
                }
                
                return user as User;
            }
            
            if (profile.role === "PROVIDER") {
                let provider = await this.providerRepositoryImpl.findProviderByGoogleId(profile.googleId);
                
                if (!provider) {
                    provider = await this.providerRepositoryImpl.findProviderByEmail(profile.email);
                }
                
                if (!provider) {
                    provider = await this.providerRepositoryImpl.createProvider({
                        username: profile.name,
                        email: profile.email,
                        googleId: profile.googleId,
                        profileImage: profile.image ?? "",
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