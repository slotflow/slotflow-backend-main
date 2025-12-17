import { adminConfig } from "../../../config/env";
import { roleArray } from "../../../shared/utils/constants";
import { User } from "../../../domain/entities/user.entity";
import { JWTService } from "../../../infrastructure/security/jwt";
import { Provider } from "../../../domain/entities/provider.entity";
import { PasswordHasher } from "../../../infrastructure/security/password-hashing";
import { LoginRequest, LoginResponse } from "../../dtos/auth.dto";
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
        private signedUrlService: ISignedUrlService
    ) { }

    async execute(payload: LoginRequest): Promise<LoginResponse> {
        try {
            const { email, password, role } = payload;

            if (!email || !password || !role) throw new Error("Invalid request.");

            let userOrProvider: User | Provider | null = null;

            if (role === roleArray[1]) {
                userOrProvider = await this.userRepository.findUserByEmail(email);
            } else if (role === roleArray[2]) {
                userOrProvider = await this.providerRepository.findProviderByEmail(email);
            } else if (role === roleArray[0]) {
                if (email !== adminConfig.adminEmail || password !== adminConfig.adminPassword) {
                    throw new Error("Invalid credentials.");
                }
                const token = JWTService.generateToken({ email: email, role: role });
                return { success: true, message: "Logged In Successfully.", authUser: { username: "Admin", profileImage: "", role: role, token, isLoggedIn: true } };
            } else {
                throw new Error("Invalid request.");
            }

            if (!userOrProvider) throw new Error("Invalid credentials")
            if (userOrProvider.isBlocked) throw new Error("Your account is blocked, please contact us.");
            if (!userOrProvider.isEmailVerified) throw new Error("Your registration was incomplete, please register again.");

            const valid = await PasswordHasher.comparePassword(password, userOrProvider.password);
            if (!valid) throw new Error("Invalid credentials.");

            const token = JWTService.generateToken({ userOrProviderId: userOrProvider._id, role: role });

            let isAddressAdded;
            let isServiceDetailsAdded;
            let isServiceAvailabilityAdded;
            let isAdminVerified;
            let isProofSubmitted;
            let updateProfileImage;
            let subscriptiondId;
            let subscription;
            let subscribedPlanId;
            let subscribedPlan;
            let providerSubscription;

            isAddressAdded = userOrProvider.addressId ? true : false;

            if (role === roleArray[2]) {
                isServiceDetailsAdded = (userOrProvider as Provider).serviceId ? true : false;
                isServiceAvailabilityAdded = (userOrProvider as Provider).serviceAvailabilityId ? true : false;
                isAdminVerified = (userOrProvider as Provider).isAdminVerified ? true : false;
                subscriptiondId = (userOrProvider as Provider).subscription[(userOrProvider as Provider).subscription.length - 1];
                subscription = await this.subscriptionRepository.findSubscriptionById(subscriptiondId);
                if (subscription) {
                    const now = new Date();
                    const isActive = subscription.subscriptionStatus === "Active" && new Date(subscription.endDate) > now;
                    if (isActive) {
                        subscribedPlanId = subscription.subscriptionPlanId;
                        subscribedPlan = await this.planRepository.findPlanById(subscribedPlanId);
                        providerSubscription = subscribedPlan?.planName;
                    } else {
                        providerSubscription = "NoSubscription"
                    }
                }
                isProofSubmitted = ((userOrProvider as Provider).identityProof && (userOrProvider as Provider).serviceProof) ? true : false;
            }

            if (userOrProvider.profileImage) {
                const userOrProviderProfileUrl = userOrProvider.profileImage;
                if (!userOrProviderProfileUrl) throw new Error("Profile image fetching error.");
                const signedUrl = await this.signedUrlService.generate(userOrProviderProfileUrl);
                if (!signedUrl) throw new Error("Image fetching error.");
                updateProfileImage = signedUrl
            }

            return {
                success: true,
                message: 'Logged In Successfully.',
                authUser: {
                    uid: userOrProvider._id,
                    username: userOrProvider.username,
                    phone: userOrProvider.phone,
                    profileImage: updateProfileImage ? updateProfileImage : userOrProvider.profileImage,
                    role: role,
                    token,
                    isBlocked: userOrProvider.isBlocked,
                    isLoggedIn: true,
                    isAddressAdded,
                    isServiceDetailsAdded,
                    isServiceAvailabilityAdded,
                    isAdminVerified,
                    isProofSubmitted,
                    adminVerificationStatus: (userOrProvider as Provider).adminVerificationStatus,
                    isAddressVerified: (userOrProvider as Provider).isAddressVerified,
                    isAvailabilityVerified: (userOrProvider as Provider).isAvailabilityVerified,
                    isProofsVerified: (userOrProvider as Provider).isProofsVerified,
                    isServiceDetailsVerified: (userOrProvider as Provider).isServiceDetailsVerified,
                    verificationRejectionReason: (userOrProvider as Provider).verificationRejectionReason,
                    providerSubscription,
                    googleConnected: userOrProvider.googleConnected,
                    updatedAt: userOrProvider.updatedAt
                }
            };
        } catch (error) {
            console.log("LoginUseCase error : ", error);
            throw new Error(`Failed to login : ${error}`);
        }
    }
}