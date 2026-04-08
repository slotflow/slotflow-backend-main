import { adminConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { PlanName } from "../../../domain/enums/plan.enum";
import { IJWT } from "../../../domain/interfaces/security/IJwt";
import { LoginRequest, LoginResponse } from "../../dtos/auth.dto";
import { SubscriptionStatus } from "../../../domain/enums/subscription.enum";
import { IPasswordHasher } from "../../../domain/interfaces/security/IPasswordHasher";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class LoginUseCase {
    constructor(
        private userRepository: IUserRepository,
        private providerProfileRepository: IProviderProfileRepository,
        private planRepository: IPlanRepository,
        private subscriptionRepository: ISubscriptionRepository,
        private signedUrlService: ISignedUrlService,
        private jwtService: IJWT,
        private passwordHasher: IPasswordHasher
    ) { };

    async execute(payload: LoginRequest): Promise<LoginResponse> {
        try {
            const { email, password } = payload;
            if (!email || !password) throw new Error("Invalid request.");

            const user = await this.userRepository.findByEmail(email);
            if (!user) throw new Error("Invalid credentials");
            if (user.isBlocked) throw new Error("Your account is blocked, please contact us");
            if (!user.password) throw new Error("Invalid request");

            const valid = await this.passwordHasher.comparePassword(password, user.password);
            if (!valid) throw new Error("Invalid credentials.");

            const token = await this.jwtService.generateToken({ email: email, role: user.role })

            let signedProfileImageUrl: string = "";
            if (user.profileImage) {
                signedProfileImageUrl = await this.signedUrlService.save(user.profileImage);
            };

            if (user.role === Role.USER) {

                return {
                    authUser: {
                        uid: user._id,
                        username: user.username,
                        phone: user.phone ?? undefined,
                        profileImage: signedProfileImageUrl,
                        role: user.role,
                        token,
                        isBlocked: user.isBlocked,
                        isLoggedIn: true,
                        googleConnected: user.googleConnected,
                        stripeConnected: user.stripeConnected,
                    },
                };

            } else if (user.role === Role.PROVIDER) {
                const providerProfile = await this.providerProfileRepository.findById(user._id);
                if (!providerProfile) throw new Error("Invalid request");

                let providerSubscription: string | undefined = PlanName.NO_SUBSCRIPTION;

                const subscriptions = providerProfile?.subscription;

                if (Array.isArray(subscriptions) && subscriptions.length > 0) {
                    const subscriptionId = subscriptions[subscriptions.length - 1];
                    console.log("subscriptionId : ", subscriptionId);

                    const subscription = await this.subscriptionRepository.findById(subscriptionId);
                    console.log("subscription : ", subscription);

                    if (subscription) {
                        console.log("subscription is found")
                        const now = new Date();
                        const isActive =
                            subscription.subscriptionStatus === SubscriptionStatus.ACTIVE &&
                            new Date(subscription.endDate) > now;

                        console.log("isActive : ", isActive);

                        if (isActive) {
                            const subscribedPlan =
                                await this.planRepository.findById(
                                    subscription.subscriptionPlanId
                                );
                            console.log("subscribedPlan : ", subscribedPlan);
                            providerSubscription = subscribedPlan?.planName;
                        };
                    };
                };

                return {
                    authUser: {
                        uid: user._id,
                        username: user.username,
                        phone: user.phone ?? undefined,
                        profileImage: signedProfileImageUrl,
                        role: user.role,
                        token,
                        isBlocked: user.isBlocked,
                        isLoggedIn: true,
                        isAddressAdded: !!providerProfile.addressId,
                        isServiceDetailsAdded: !!providerProfile.serviceId,
                        isServiceAvailabilityAdded: !!providerProfile.serviceAvailabilityId,
                        isAdminVerified: providerProfile.isAdminVerified,
                        isProofSubmitted: !!providerProfile.identityProof && !!providerProfile.serviceProof,
                        adminVerificationStatus: providerProfile.adminVerificationStatus,
                        isAddressVerified: providerProfile.isAddressVerified,
                        isAvailabilityVerified: providerProfile.isAvailabilityVerified,
                        isProofsVerified: providerProfile.isProofsVerified,
                        isServiceDetailsVerified: providerProfile.isServiceDetailsVerified,
                        verificationRejectionReason: providerProfile.verificationRejectionReason,
                        providerSubscription,
                        googleConnected: user.googleConnected,
                        stripeConnected: user.stripeConnected
                    },
                };
            }
            throw new Error("Invalid request");
        } catch (error) {
            log.error("LoginUseCase failed", error as Error);
            throw error;
        };
    };
};