import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { User } from "../../../domain/entities/user.entity";
import { PlanName } from "../../../domain/enums/plan.enum";
import { IJWT } from "../../../domain/interfaces/security/IJwt";
import { Provider } from "../../../domain/entities/provider.entity";
import { Credential } from "../../../domain/entities/credential.entity";
import { SendAppConnectEvent, SendWelcomeEvent } from "../../dtos/kafka.dtos";
import { SubscriptionStatus } from "../../../domain/enums/subscription.enum";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/message/IKafkaProducerAdapter";
import { IAesEncryptionService } from "../../../domain/interfaces/services/IAesEncryption.service";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { GoogleAuthOrchestrationRequest, GoogleAuthOrchestrationResponse } from "../../dtos/auth.dto";
import { ICredentialRepository } from "../../../domain/interfaces/repositories/ICredentialRepository";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";
import { AppConnect, Role } from "../../../domain/enums/common.enum";

export class GoogleAuthOrchestratorUseCase {
    constructor(
        private userRepository: IUserRepository,
        private providerRepository: IProviderRepository,
        private credentialRepository: ICredentialRepository,
        private aesEncryption: IAesEncryptionService,
        private subscriptionRepository: ISubscriptionRepository,
        private planRepository: IPlanRepository,
        private jwtService: IJWT,
        private kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(payload: GoogleAuthOrchestrationRequest): Promise<GoogleAuthOrchestrationResponse> {
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
                if (role === Role.USER) {
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
                    };
                    entity = user;
                };

                if (role === Role.PROVIDER) {
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
                    };
                    entity = providerEntity;
                };

                token = await this.jwtService.generateToken({
                    email,
                    userOrProviderId: entity?._id,
                    role,
                });
            } else {
                if (!userId || !role) {
                    throw new Error("Invalid connect flow");
                };

                if (role === Role.USER) {
                    const user = await this.userRepository.findById(userId);
                    if (!user) throw new Error("User not found");

                    user.linkGoogleAccount({
                        googleId,
                        googleConnected: true,
                    });
                    entity = await this.userRepository.update(user);
                };

                if (role === Role.PROVIDER) {
                    const providerEntity =
                        await this.providerRepository.findById(userId);
                    if (!providerEntity) throw new Error("User not found");

                    providerEntity.linkGoogleAccount({
                        googleId,
                        googleConnected: true,
                    });
                    entity = await this.providerRepository.update(providerEntity);
                };
            };

            const encryptedAccessToken =
                await this.aesEncryption.encrypt(accessToken);
            const encryptedRefreshToken =
                await this.aesEncryption.encrypt(refreshToken);

            const existingCredential = await this.credentialRepository.findByUserId(userId ?? entity?._id!);
            if (existingCredential) {
                existingCredential.updateCredential({
                    accessToken: encryptedAccessToken,
                    refreshToken: encryptedRefreshToken,
                    expiryDate,
                });
                await this.credentialRepository.update(existingCredential);
            } else {
                const credentials = Credential.create({
                    accessToken: encryptedAccessToken,
                    refreshToken: encryptedRefreshToken,
                    expiryDate,
                    userId: userId ?? entity?._id!,
                });
                await this.credentialRepository.create(credentials);
            };

            let providerSubscription: string | undefined = PlanName.NO_SUBSCRIPTION;

            const subscriptions = (entity as Provider)?.subscription;

            if (Array.isArray(subscriptions) && subscriptions.length > 0 && role === Role.PROVIDER) {
                const subscriptionId = subscriptions[subscriptions.length - 1];

                const subscription = await this.subscriptionRepository.findById(subscriptionId);

                if (subscription) {
                    const now = new Date();
                    const isActive =
                        subscription.subscriptionStatus === SubscriptionStatus.ACTIVE &&
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

            if (!entity) throw new Error("Invalid request");


            if (!entity.googleConnected) {
                if (connectOnly) {
                    await this.kafkaProducer.publish<SendAppConnectEvent>(kafkaConfig.topics.pub.appConnect, {
                        email: entity.email,
                        name: entity.username,
                        appConnect: AppConnect.GOOGLE,
                        userOrProviderId: entity._id,
                    });
                } else {
                    await this.kafkaProducer.publish<SendWelcomeEvent>(kafkaConfig.topics.pub.registerSuccess, {
                        email: entity.email,
                        name: entity.username,
                        role
                    });
                };
            }

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
                    allowPushNotification: entity.allowPushNotification,
                },
            };

        } catch (error) {
            log.error("GoogleAuthOrchestratorUseCase failed : ", error as Error,);
            throw error;
        };
    };
};
