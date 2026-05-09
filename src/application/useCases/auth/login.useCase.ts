import { Role } from "../../../domain/enums/common.enum";
import { ERROR_CODES } from "../../../shared/utils/types";
import { PlanName } from "../../../domain/enums/plan.enum";
import { LoginInput, LoginOutput } from "../../dtos/auth.dto";
import { IJWT } from "../../../domain/interfaces/security/IJwt";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AuthResponseBuilder } from "../../services/AuthResponseBuilder";
import { ProviderProfile } from "../../../domain/entities/providerProfile.entity";
import { BadRequestError, UnauthorizedError } from "../../../shared/error/appError";
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
            if(!email || !password) {
                throw new BadRequestError()
            }
            
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                throw new BadRequestError(
                    "Invalid credentials", 
                    ERROR_CODES.INVALID_CREDENTIALS
                );
            }

            if (user.isBlocked) {
                throw new UnauthorizedError(
                    "Your account is blocked, please contact us",
                    ERROR_CODES.ACCOUNT_BLOCKED
                );
            }

            if (!user.password) {
                throw new BadRequestError(
                    "Invalid request",
                    ERROR_CODES.INVALID_REQUEST
                );
            }
                        
            const valid = await this.passwordHasher.comparePassword(
                password,
                user.password
            );
            if (!valid) {
                throw new BadRequestError(
                    "Invalid credentials",
                    ERROR_CODES.INVALID_CREDENTIALS
                );
            }

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
            const isProviderFlow = user.onboardingType === Role.PROVIDER ;

            if (isProviderFlow) {
                providerProfile = await this.providerProfileRepository.findByUserId(user._id);
                console.log("providerProfile : ",providerProfile);

                if (providerProfile) {
                    providerSubscription = await this.authResponseBuilder.resolveSubscription(
                        providerProfile
                    );
                }
            }

            const baseUser = this.authResponseBuilder.buildBaseUser(user);

            if (isProviderFlow) {
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
            } else if(user.role === Role.USER) {
                return {
                    token,
                    user: baseUser,
                };
            } else if(user.role === Role.ADMIN) {
                return {
                    token,
                    user: baseUser,
                };
            }

            throw new BadRequestError();
        } catch (error: unknown) {
            throw toAppError(error, "Login failed")
        };
    };
};