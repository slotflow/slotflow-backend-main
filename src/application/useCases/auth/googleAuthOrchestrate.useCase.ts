// import { log } from "../../../shared/logger/logger";
// import { Role } from "../../../domain/enums/role.enum";
// import { User } from "../../../domain/entities/user.entity";
// import { JWTService } from "../../../infrastructure/security/jwt";
// import { Provider } from "../../../domain/entities/provider.entity";
// import { Credential } from "../../../domain/entities/credential.entity";
// import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
// import { IAesEncryptionService } from "../../../domain/interfaces/services/IAesEncryption.service";
// import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
// import { GoogleAuthOrchestrationRequest, GoogleAuthOrchestrationResponse } from "../../dtos/auth.dto";
// import { ICredentialRepository } from "../../../domain/interfaces/repositories/ICredentialRepository";
// import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";
// import { SubscriptionStatus } from "../../../domain/enums/subscriptionStatus.enum";
// import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";

// export class GoogleAuthOrchestratorUseCase {
//     constructor(
//         private userRepository: IUserRepository,
//         private providerRepository: IProviderRepository,
//         private credentialRepository: ICredentialRepository,
//         private aesEncryption: IAesEncryptionService,
//         private subscriptionRepository: ISubscriptionRepository,
//         private planRepository: IPlanRepository,
//     ) { };

//     async execute(payload: GoogleAuthOrchestrationRequest): Promise<GoogleAuthOrchestrationResponse> {
//         try {

//             const { connectOnly, role, userId, email, googleId, name, image, accessToken, expiryDate, refreshToken } = payload;

//             let entity: Provider | User | null = null;
//             let token;
//             let provider: Provider | null = null;

//             if (!connectOnly) {
//                 console.log("ConnectOnly false : ", connectOnly)
//                 if (role === Role.User) {
//                     let user = await this.userRepository.findByGoogleId(googleId);

//                     if (!user) {
//                         user = await this.userRepository.findByEmail(email);
//                     }

//                     if (!user) {
//                         const userData = User.createGoogle({
//                             username: name,
//                             email,
//                             googleId,
//                             isEmailVerified: true,
//                             profileImage: image ?? "",
//                         });
//                         user = await this.userRepository.create(userData);
//                     }

//                     entity = { ...user.getProps() };
//                 };

//                 if (role === Role.Provider) {
//                     let provider = await this.providerRepository.findByGoogleId(googleId);

//                     if (!provider) {
//                         provider = await this.providerRepository.findByEmail(email);
//                     }

//                     if (!provider) {
//                         const providerData = Provider.createGoogle({
//                             username: name,
//                             email,
//                             googleId,
//                             isEmailVerified: true,
//                             profileImage: image ?? "",
//                         });
//                         provider = await this.providerRepository.create(providerData);
//                     }
//                     entity = { ...provider.getProps() };
//                 }

//                 token = JWTService.generateToken({ email: email, userOrProviderId: entity?._id, role: role });

//             } else {
//                 console.log("connectOnly true : ", connectOnly);
//                 if (!userId || !role) throw new Error("Invalid connect flow");

//                 if (role === Role.User) {
//                     const user = await this.userRepository.findById(userId);
//                     if (!user) throw new Error("User not found");
//                     user.linkGoogleAccount({ googleId, googleConnected: true });
//                     await this.userRepository.update(user);
//                 };

//                 if (role === Role.Provider) {
//                     provider = await this.providerRepository.findById(userId);
//                     if (!provider) throw new Error("User not found");
//                     provider.linkGoogleAccount({ googleId, googleConnected: true });
//                     await this.providerRepository.update(provider);
//                 };
//             };

//             const encryptedAccessToken = await this.aesEncryption.encrypt(accessToken);
//             const encryptedRefreshToken = await this.aesEncryption.encrypt(refreshToken);

//             const credentials = Credential.create({
//                 accessToken: encryptedAccessToken,
//                 refreshToken: encryptedRefreshToken,
//                 expiryDate,
//                 userId: userId ?? (entity as User | Provider)._id,
//             });

//             await this.credentialRepository.create(credentials);

//             let providerSubscription: string | undefined = undefined;
//             if (entity) {
//                 const subscriptionId = entity.subscription[entity.subscription.length - 1];
//                 let subscription = await this.subscriptionRepository.findById(subscriptionId);
//                 if (subscription) {
//                     const now = new Date();
//                     const isActive = subscription.subscriptionStatus === SubscriptionStatus.Active && new Date(subscription.endDate) > now;
//                     if (isActive) {
//                         const subscribedPlanId = subscription.subscriptionPlanId;
//                         const subscribedPlan = await this.planRepository.findById(subscribedPlanId);
//                         providerSubscription = subscribedPlan?.planName;
//                     } else {
//                         providerSubscription = "NoSubscription"
//                     };
//                 };
//             };



//             return {
//                 token, user: {
//                     _id: entity?._id!,
//                     isAddressAdded: !!entity?.addressId,
//                     isServiceDetailsAdded: !!entity?.serviceId,
//                     isServiceAvailabilityAdded: !!entity?.serviceAvailabilityId,
//                     isAdminVerified: entity?.isAdminVerified,
//                     isProofSubmitted: !!entity?.identityProof && !!entity.serviceProof,
//                     adminVerificationStatus: entity?.adminVerificationStatus,
//                     isAddressVerified: entity?.isAddressVerified,
//                     isAvailabilityVerified: entity?.isAvailabilityVerified,
//                     isProofsVerified: entity?.isProofsVerified,
//                     isServiceDetailsVerified: entity?.isServiceDetailsVerified,
//                     verificationRejectionReason: entity?.verificationRejectionReason,
//                     providerSubscription,
//                 }
//             };
//         } catch (error) {
//             log.error("GoogleAuthOrchestratorUseCase failed : ", error as Error);
//             throw error;
//         };
//     };
// };

import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/role.enum";
import { User } from "../../../domain/entities/user.entity";
import { JWTService } from "../../../infrastructure/security/jwt";
import { Provider } from "../../../domain/entities/provider.entity";
import { Credential } from "../../../domain/entities/credential.entity";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IAesEncryptionService } from "../../../domain/interfaces/services/IAesEncryption.service";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import {
    GoogleAuthOrchestrationRequest,
    GoogleAuthOrchestrationResponse,
} from "../../dtos/auth.dto";
import { ICredentialRepository } from "../../../domain/interfaces/repositories/ICredentialRepository";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";
import { SubscriptionStatus } from "../../../domain/enums/subscriptionStatus.enum";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";

export class GoogleAuthOrchestratorUseCase {
    constructor(
        private userRepository: IUserRepository,
        private providerRepository: IProviderRepository,
        private credentialRepository: ICredentialRepository,
        private aesEncryption: IAesEncryptionService,
        private subscriptionRepository: ISubscriptionRepository,
        private planRepository: IPlanRepository,
    ) { }

    async execute(
        payload: GoogleAuthOrchestrationRequest,
    ): Promise<GoogleAuthOrchestrationResponse> {
        try {
            const {
                connectOnly,
                role,
                userId,
                email,
                googleId,
                name,
                image,
                accessToken,
                expiryDate,
                refreshToken,
            } = payload;

            let entity: (User | Provider) | null = null;
            let token: string | undefined;

            if (!connectOnly) {
                if (role === Role.User) {
                    let user =
                        (await this.userRepository.findByGoogleId(googleId)) ??
                        (await this.userRepository.findByEmail(email));

                    if (!user) {
                        const userData = User.createGoogle({
                            username: name,
                            email,
                            googleId,
                            isEmailVerified: true,
                            profileImage: image ?? "",
                        });
                        user = await this.userRepository.create(userData);
                    }

                    entity = user;
                }

                if (role === Role.Provider) {
                    let providerEntity =
                        (await this.providerRepository.findByGoogleId(googleId)) ??
                        (await this.providerRepository.findByEmail(email));

                    if (!providerEntity) {
                        const providerData = Provider.createGoogle({
                            username: name,
                            email,
                            googleId,
                            isEmailVerified: true,
                            profileImage: image ?? "",
                        });
                        providerEntity =
                            await this.providerRepository.create(providerData);
                    }

                    entity = providerEntity;
                }

                token = JWTService.generateToken({
                    email,
                    userOrProviderId: entity?._id,
                    role,
                });
            } else {
                if (!userId || !role) {
                    throw new Error("Invalid connect flow");
                }

                if (role === Role.User) {
                    const user = await this.userRepository.findById(userId);
                    if (!user) throw new Error("User not found");

                    user.linkGoogleAccount({
                        googleId,
                        googleConnected: true,
                    });
                    await this.userRepository.update(user);
                }

                if (role === Role.Provider) {
                    const providerEntity =
                        await this.providerRepository.findById(userId);
                    if (!providerEntity) throw new Error("User not found");

                    providerEntity.linkGoogleAccount({
                        googleId,
                        googleConnected: true,
                    });
                    await this.providerRepository.update(providerEntity);
                }
            }

            const encryptedAccessToken =
                await this.aesEncryption.encrypt(accessToken);
            const encryptedRefreshToken =
                await this.aesEncryption.encrypt(refreshToken);

            const credentials = Credential.create({
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                expiryDate,
                userId: userId ?? entity?._id!,
            });

            await this.credentialRepository.create(credentials);

            let providerSubscription: string | undefined = "NoSubscription";

            const subscriptions = (entity as Provider)?.subscription;

            if (Array.isArray(subscriptions) && subscriptions.length > 0) {
                const subscriptionId = subscriptions[subscriptions.length - 1];

                const subscription = await this.subscriptionRepository.findById(subscriptionId);

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
                token,
                user: {
                    _id: entity?._id!,
                    isAddressAdded: !!entity?.addressId,
                    isServiceDetailsAdded: !!(entity as Provider)?.serviceId,
                    isServiceAvailabilityAdded:
                        !!(entity as Provider)?.serviceAvailabilityId,
                    isAdminVerified: (entity as Provider)?.isAdminVerified,
                    isProofSubmitted:
                        !!(entity as Provider)?.identityProof &&
                        !!(entity as Provider)?.serviceProof,
                    adminVerificationStatus:
                        (entity as Provider)?.adminVerificationStatus,
                    isAddressVerified: (entity as Provider)?.isAddressVerified,
                    isAvailabilityVerified:
                        (entity as Provider)?.isAvailabilityVerified,
                    isProofsVerified: (entity as Provider)?.isProofsVerified,
                    isServiceDetailsVerified:
                        (entity as Provider)?.isServiceDetailsVerified,
                    verificationRejectionReason:
                        (entity as Provider)?.verificationRejectionReason,
                    providerSubscription,
                },
            };
        } catch (error) {
            log.error(
                "GoogleAuthOrchestratorUseCase failed : ",
                error as Error,
            );
            throw error;
        }
    }
}
