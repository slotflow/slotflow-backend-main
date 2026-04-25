import { kafkaConfig } from "../../../config/env";
import { PlanName } from "../../../domain/enums/plan.enum";
import { User } from "../../../domain/entities/user.entity";
import { generateId } from "../../../shared/utils/generateId";
import { IJWT } from "../../../domain/interfaces/security/IJwt";
import { BadRequestError } from '../../../shared/error/appError';
import { ERROR_CODES, IdType } from '../../../shared/utils/types';
import { AppConnect, Role } from "../../../domain/enums/common.enum";
import { toAppError } from '../../../shared/error/handleUnknownError';
import { Credential } from "../../../domain/entities/credential.entity";
import { notificationContentMap } from "../../../shared/utils/constants";
import { AuthResponseBuilder } from '../../services/AuthResponseBuilder';
import { ProviderProfile } from '../../../domain/entities/providerProfile.entity';
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { EventEnvelope, SendAppConnectEvent, SendWelcomeEvent } from "../../dtos/kafka.dto";
import { GoogleAuthOrchestrationInput, GoogleAuthOrchestrationOutput } from "../../dtos/auth.dto";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { IAesEncryptionService } from "../../../domain/interfaces/services/IAesEncryption.service";
import { ICredentialRepository } from "../../../domain/interfaces/repositories/ICredentialRepository";
import { IProviderProfileRepository } from '../../../domain/interfaces/repositories/IProviderProfile.repository';

export class GoogleAuthOrchestratorUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly providerProfileRepository: IProviderProfileRepository,
        private readonly credentialRepository: ICredentialRepository,
        private readonly aesEncryption: IAesEncryptionService,
        private readonly jwtService: IJWT,
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly authResponseBuilder: AuthResponseBuilder
    ) { };

    async execute(input: GoogleAuthOrchestrationInput): Promise<GoogleAuthOrchestrationOutput> {
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
            } = input;

            let user: User | null = null;
            let providerProfile: ProviderProfile | null = null;
            let token: string | undefined;

            if (!connectOnly) {
                if(!role || !email || !googleId || !name) {
                    throw new BadRequestError(
                        "Invalid request",
                        ERROR_CODES.INVALID_REQUEST
                    );
                }
                user =
                    (await this.userRepository.findByGoogleId(googleId)) ??
                    (await this.userRepository.findByEmail(email));

                if (!user) {
                    const userData = User.createGoogle({
                        username: name,
                        email,
                        googleId,
                        profileImage: image ?? "",
                    });
                    user = await this.userRepository.create(userData);
                }

                if (role === Role.PROVIDER) {
                    providerProfile = await this.providerProfileRepository.findById(user._id);

                    if (!providerProfile) {
                        const newProfile = ProviderProfile.create({
                            userId: user._id,
                        });
                        providerProfile =
                            await this.providerProfileRepository.create(newProfile);
                    }
                }

                token = await this.jwtService.generateToken({
                    email,
                    userId: user._id,
                    role,
                });
            } else {
                if (!userId || !role) {
                    throw new BadRequestError(
                        "Invalid request",
                        ERROR_CODES.INVALID_REQUEST
                    );
                }

                user = await this.userRepository.findById(userId);
                if (!user) throw new BadRequestError("User not found");

                user.linkGoogleAccount({
                    googleId,
                    googleConnected: true,
                });

                user = await this.userRepository.update(user);
            }

            if (!user) {
                throw new BadRequestError(
                    "Invalid request",
                    ERROR_CODES.INVALID_REQUEST
                );
            }

            if (!accessToken || !expiryDate || !refreshToken) {
                throw new BadRequestError(
                    "Invalid request",
                    ERROR_CODES.INVALID_REQUEST
                );
            }

            const encryptedAccessToken =
                await this.aesEncryption.encrypt(accessToken);
            const encryptedRefreshToken =
                await this.aesEncryption.encrypt(refreshToken);

            const existingCredential =
                await this.credentialRepository.findByUserId(
                    userId ?? user._id
                );

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
                    userId: userId ?? user._id,
                });
                await this.credentialRepository.create(credentials);
            }

            let providerSubscription: PlanName = PlanName.NO_SUBSCRIPTION;

            if (user.role === Role.PROVIDER && providerProfile) {
                providerSubscription = await this.authResponseBuilder.resolveSubscription(providerProfile);
            }

            if (!user.googleConnected) {
                if (connectOnly) {
                    await this.kafkaProducer.publish<EventEnvelope<SendAppConnectEvent>>(kafkaConfig.topics.pub.appConnect, {
                        eventId: generateId(IdType.EVENT),
                        attempt: 1,
                        maxAttempts: 1,
                        occurredAt: new Date().toISOString(),
                        payload: {
                            emailData: {
                                email: user.email,
                                name: user.username,
                                appConnect: AppConnect.GOOGLE,
                            },
                            notificationData: {
                                userId: user._id,
                                pushNotification: user.allowPushNotification ?? false,
                                title: notificationContentMap.appConnect.title,
                                body: notificationContentMap.appConnect.body(
                                    AppConnect.GOOGLE
                                ),
                            },
                        },
                    });
                } else {
                    await this.kafkaProducer.publish<EventEnvelope<SendWelcomeEvent>>(kafkaConfig.topics.pub.registerSuccess, {
                        eventId: generateId(IdType.EVENT),
                        attempt: 1,
                        maxAttempts: 1,
                        occurredAt: new Date().toISOString(),
                        payload: {
                            emailData: {
                                email: user.email,
                                name: user.username,
                                role,
                            },
                        },
                    });
                }
            }

            if (connectOnly) {
                return {
                    token,
                    user: {
                        googleId,
                        googleConnected: true,
                    },
                };
            }

            const baseUser = this.authResponseBuilder.buildBaseUser(user);

            return {
                token,
                user: {
                    ...baseUser,
                    ...this.authResponseBuilder.buildProviderFields(
                        providerProfile,
                        providerSubscription
                    ),
                    googleId,
                    googleConnected: true,
                },
            };

        } catch (error: unknown) {
            throw toAppError(error, "Failed to authenticate user");
        };
    };
};
