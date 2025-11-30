import { adminConfig } from "../../config/env";
import { User } from "../../domain/entities/user.entity";
import { JWTService } from "../../infrastructure/security/jwt";
import { Provider } from "../../domain/entities/provider.entity";
import { roleArray } from "../../utils/constants";
import { PasswordHasher } from "../../infrastructure/security/password-hashing";
import { LoginRequest, LoginResponse } from "../../infrastructure/dtos/auth.dto";
import { GenerateSignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { PlanRepositoryImpl } from "../../infrastructure/database/plan/plan.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";

export class LoginUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
        private providerRepositoryImpl: ProviderRepositoryImpl,
        private planRepositoryImpl: PlanRepositoryImpl,
        private subscriptionRepositoryImpl: SubscriptionRepositoryImpl,
        private generateSignedUrlService: GenerateSignedUrlService
    ) { }

    async execute(payload: LoginRequest): Promise<LoginResponse> {
        try {
            const { email, password, role } = payload;

            if (!email || !password || !role) throw new Error("Invalid request.");

            let userOrProvider: User | Provider | null = null;

            if (role === roleArray[1]) {
                userOrProvider = await this.userRepositoryImpl.findUserByEmail(email);
            } else if (role === roleArray[2]) {
                userOrProvider = await this.providerRepositoryImpl.findProviderByEmail(email);
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
            let isAdminApproved;
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
                isAdminApproved = (userOrProvider as Provider).isAdminVerified ? true : false;
                subscriptiondId = (userOrProvider as Provider).subscription[(userOrProvider as Provider).subscription.length - 1];
                subscription = await this.subscriptionRepositoryImpl.findSubscriptionById(subscriptiondId);
                if (subscription) {
                    const now = new Date();
                    const isActive = subscription.subscriptionStatus === "Active" && new Date(subscription.endDate) > now;
                    if (isActive) {
                        subscribedPlanId = subscription.subscriptionPlanId;
                        subscribedPlan = await this.planRepositoryImpl.findPlanById(subscribedPlanId);
                        providerSubscription = subscribedPlan?.planName;
                    } else {
                        providerSubscription = "NoSubscription"
                    }
                }
            }

            if (userOrProvider.profileImage) {
                const userOrProviderProfileUrl = userOrProvider.profileImage;
                if (!userOrProviderProfileUrl) throw new Error("Profile image fetching error.");
                const signedUrl = await this.generateSignedUrlService.execute(userOrProviderProfileUrl);
                if (!signedUrl) throw new Error("Image fetching error.");
                updateProfileImage = signedUrl
            }

            return {
                success: true,
                message: 'Logged In Successfully.',
                authUser: {
                    uid: userOrProvider._id,
                    username: userOrProvider.username,
                    profileImage: updateProfileImage ? updateProfileImage : userOrProvider.profileImage,
                    role: role,
                    token,
                    isBlocked: userOrProvider.isBlocked,
                    isLoggedIn: true,
                    isAddressAdded,
                    isServiceDetailsAdded,
                    isServiceAvailabilityAdded,
                    isAdminApproved,
                    providerSubscription,
                    googleConnected: userOrProvider.googleConnected,
                    updatedAt: userOrProvider.updatedAt
                }
            };
        } catch (error) {
            console.log("LoginUseCase error : ", error);
            throw new Error("Failed to login");
        }
    }
}