import { adminConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/role.enum";
import { PlanName } from "../../../domain/enums/planName.enum";
import { JWTService } from "../../../infrastructure/security/jwt";
import { LoginRequest, LoginResponse } from "../../dtos/auth.dto";
import { SubscriptionStatus } from "../../../domain/enums/subscriptionStatus.enum";
import { PasswordHasher } from "../../../infrastructure/security/password-hashing";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";

export class LoginUseCase {
    constructor(
        private userRepository: IUserRepository,
        private providerRepository: IProviderRepository,
        private planRepository: IPlanRepository,
        private subscriptionRepository: ISubscriptionRepository,
        private signedUrlService: ISignedUrlService,
    ) { };

    async execute(payload: LoginRequest): Promise<LoginResponse> {
        try {
            const { email, password, role } = payload;

            if (!email || !password || !role) throw new Error("Invalid request.");

            if (role === Role.User) {
                const user = await this.userRepository.findByEmail(email);
                if (!user) throw new Error("Invalid credentials");
                if (user.isBlocked) throw new Error("Your account is blocked, please contact us");
                if (!user.isEmailVerified) throw new Error("Your registration is incomplete, please register again.");
                if (!user.password) throw new Error("Invalid request");

                const valid = await PasswordHasher.comparePassword(password, user.password);
                if (!valid) throw new Error("Invalid credentials.");

                const token = JWTService.generateToken({ userOrProviderId: user._id, role: role });

                let signedProfileImageUrl: string = "";
                if (user.profileImage) {
                    signedProfileImageUrl = await this.signedUrlService.save(user.profileImage);
                };

                return {
                    authUser: {
                        uid: user._id,
                        username: user.username,
                        phone: user.phone ?? undefined,
                        profileImage: signedProfileImageUrl,
                        role: role,
                        token,
                        isBlocked: user.isBlocked,
                        isLoggedIn: true,
                        googleConnected: user.googleConnected,
                    },
                };

            } else if (role === Role.Provider) {
                const provider = await this.providerRepository.findByEmail(email);
                if (!provider) throw new Error("Invalid credentials");
                if (provider.isBlocked) throw new Error("Your account is blocked, please contact us");
                if (!provider.isEmailVerified) throw new Error("Your registration is incomplete, please register again.");
                if (!provider.password) throw new Error("Invalid request");

                const valid = await PasswordHasher.comparePassword(password, provider.password);
                if (!valid) throw new Error("Invalid credentials.");

                const token = JWTService.generateToken({ userOrProviderId: provider._id, role: role });

                let signedProfileImageUrl: string = "";
                if (provider.profileImage) {
                    signedProfileImageUrl = await this.signedUrlService.save(provider.profileImage);
                };

                let providerSubscription: string | undefined = PlanName.NoSubscription;

                const subscriptions = provider?.subscription;

                if (Array.isArray(subscriptions) && subscriptions.length > 0) {
                    const subscriptionId = subscriptions[subscriptions.length - 1];

                    const subscription =
                        await this.subscriptionRepository.findById(subscriptionId);

                    if (subscription) {
                        const now = new Date();
                        const isActive =
                            subscription.subscriptionStatus === SubscriptionStatus.Active &&
                            new Date(subscription.endDate) > now;

                        if (isActive) {
                            const subscribedPlan =
                                await this.planRepository.findById(
                                    subscription.subscriptionPlanId
                                );
                            providerSubscription = subscribedPlan?.planName;
                        };
                    };
                };

                return {
                    authUser: {
                        uid: provider._id,
                        username: provider.username,
                        phone: provider.phone ?? undefined,
                        profileImage: signedProfileImageUrl,
                        role: role,
                        token,
                        isBlocked: provider.isBlocked,
                        isLoggedIn: true,
                        isAddressAdded: !!provider.addressId,
                        isServiceDetailsAdded: !!provider.serviceId,
                        isServiceAvailabilityAdded: !!provider.serviceAvailabilityId,
                        isAdminVerified: provider.isAdminVerified,
                        isProofSubmitted: !!provider.identityProof && !!provider.serviceProof,
                        adminVerificationStatus: provider.adminVerificationStatus,
                        isAddressVerified: provider.isAddressVerified,
                        isAvailabilityVerified: provider.isAvailabilityVerified,
                        isProofsVerified: provider.isProofsVerified,
                        isServiceDetailsVerified: provider.isServiceDetailsVerified,
                        verificationRejectionReason: provider.verificationRejectionReason,
                        providerSubscription,
                        googleConnected: provider.googleConnected,
                    }
                };

            } else if (role === Role.Admin) {
                if (email !== adminConfig.adminEmail || password !== adminConfig.adminPassword) {
                    throw new Error("Invalid credentials.");
                }
                const token = JWTService.generateToken({ email: email, role: role });
                return {
                    authUser: {
                        username: "Admin",
                        profileImage: "",
                        role: role,
                        token,
                        isLoggedIn: true
                    }
                };
            } else {
                throw new Error("Invalid request.");
            }

        } catch (error) {
            log.error("LoginUseCase failed", error as Error);
            throw error;
        }
    }
}