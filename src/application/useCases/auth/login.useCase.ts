import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { PlanName } from "../../../domain/enums/plan.enum";
import { IJWT } from "../../../domain/interfaces/security/IJwt";
import { LoginInput, LoginOutput } from "../../dtos/auth.dto";
import { AuthResponseBuilder } from "../../services/AuthResponseBuilder";
import { ProviderProfile } from "../../../domain/entities/providerProfile.entity";
import { IPasswordHasher } from "../../../domain/interfaces/security/IPasswordHasher";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class LoginUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly providerProfileRepository: IProviderProfileRepository,
        private readonly signedUrlService: ISignedUrlService,
        private readonly jwtService: IJWT,
        private readonly passwordHasher: IPasswordHasher,
        private readonly authResponseBuilder: AuthResponseBuilder
    ) { };

    async execute(input: LoginInput): Promise<LoginOutput> {
        try {
            const { email, password } = input;

            if (!email || !password) throw new Error("Invalid request.");

            const user = await this.userRepository.findByEmail(email);
            if (!user) throw new Error("Invalid credentials");
            if (user.isBlocked)
                throw new Error("Your account is blocked, please contact us");
            if (!user.password) throw new Error("Invalid request");

            const valid = await this.passwordHasher.comparePassword(
                password,
                user.password
            );
            if (!valid) throw new Error("Invalid credentials.");

            const token = await this.jwtService.generateToken({
                email: email,
                role: user.role,
                userId: user._id,
            });

            if (user.profileImage) {
                await this.signedUrlService.save(user.profileImage);
            }

            let providerProfile: ProviderProfile | null = null;
            let providerSubscription: PlanName = PlanName.NO_SUBSCRIPTION;

            if (user.hasSelectedRole && !user.isOnboardingCompleted) {
                providerProfile = await this.providerProfileRepository.findById(user._id);

                if (providerProfile) {
                    providerSubscription = await this.authResponseBuilder.resolveSubscription(
                        providerProfile
                    );
                }
            }

            const baseUser = this.authResponseBuilder.buildBaseUser(user);

            if (user.role === Role.USER) {
                if (providerProfile) {
                    return {
                        token,
                        user: {
                            ...baseUser,
                            ...this.authResponseBuilder.buildProviderFields(
                                providerProfile,
                                providerSubscription
                            ),
                        },
                    };
                }

                return {
                    token,
                    user: baseUser,
                };
            }

            if (user.role === Role.PROVIDER) {
                return {
                    token,
                    user: {
                        ...baseUser,
                        ...this.authResponseBuilder.buildProviderFields(
                            providerProfile,
                            providerSubscription
                        ),
                    },
                };
            }

            if (user.role === Role.ADMIN) {
                return {
                    token,
                    user: baseUser,
                };
            }

            throw new Error("Invalid request");
        } catch (error) {
            log.error("LoginUseCase failed", error as Error);
            throw error;
        };
    };
};