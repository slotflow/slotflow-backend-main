import { adminConfig } from "../../config/env";
import { generateSignedUrl } from "../../config/aws_s3";
import { User } from "../../domain/entities/user.entity";
import { JWTService } from "../../infrastructure/security/jwt";
import { Provider } from "../../domain/entities/provider.entity";
import { validateOrThrow } from "../../infrastructure/validator/validator";
import { PasswordHasher } from "../../infrastructure/security/password-hashing";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { LoginRequest, LoginResponse } from "../../infrastructure/dtos/auth.dto";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { Types } from "mongoose";
import { PlanRepositoryImpl } from "../../infrastructure/database/plan/plan.repository.impl";
import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";


export class LoginUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
        private providerRepositoryImpl: ProviderRepositoryImpl,
        private planRepositoryImpl: PlanRepositoryImpl,
        private subscriptionRepositoryImpl: SubscriptionRepositoryImpl,
    ) { }

    async execute(data: LoginRequest): Promise<LoginResponse> {
        const { email, password, role } = data;
        if (!email || !password || !role) throw new Error("Invalid request.");

        validateOrThrow("email", email);
        validateOrThrow("password", password);
        validateOrThrow("role", role);

        let userOrProvider: User | Provider | null = null;

        if (role === "USER") {
            userOrProvider = await this.userRepositoryImpl.findUserByEmail(email);
        } else if (role === "PROVIDER") {
            userOrProvider = await this.providerRepositoryImpl.findProviderByEmail(email);
        } else if (role === "ADMIN") {
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

        if (role === "PROVIDER") {
            isAddressAdded = (userOrProvider as Provider).addressId ? true : false;
            isServiceDetailsAdded = (userOrProvider as Provider).serviceId ? true : false;
            isServiceAvailabilityAdded = (userOrProvider as Provider).serviceAvailabilityId ? true : false;
            isAdminApproved = (userOrProvider as Provider).isAdminVerified ? true : false;
            subscriptiondId = (userOrProvider as Provider).subscription[0];
            subscription = await this.subscriptionRepositoryImpl.findSubscriptionById(subscriptiondId);
            if (subscription) {
                const now = new Date();
                const isActive = subscription.subscriptionStatus === "Active" && new Date(subscription.endDate) > now;
                if (isActive) {
                    subscribedPlanId = subscription.subscriptionPlanId;
                    console.log("subscribedPlanId : ",subscribedPlanId);
                    subscribedPlan = await this.planRepositoryImpl.findPlanById(subscribedPlanId);
                    console.log("subscribedPlan : ", subscribedPlan);
                    providerSubscription = subscribedPlan?.planName;
                    console.log("providerSubscription : ", providerSubscription);
                } else {
                    providerSubscription = "NoSubscription"
                    console.log("Subscription is expired or inactive");
                }
            }
        }

        if (userOrProvider.profileImage) {
            const userOrProviderProfileUrl = userOrProvider.profileImage;
            if (!userOrProviderProfileUrl) throw new Error("Profile image fetching error.");
            const urlParts = userOrProviderProfileUrl?.split('/');
            if (!urlParts) throw new Error("UrlParts error.");
            const s3Key = urlParts.slice(3).join('/');
            if (!s3Key) throw new Error("Image retrieving.");
            const signedUrl = await generateSignedUrl(s3Key);
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
                isLoggedIn: true,
                isAddressAdded,
                isServiceDetailsAdded,
                isServiceAvailabilityAdded,
                isAdminApproved,
                providerSubscription,
            }
        };
    }
}