import mongoose from "mongoose";
import { kafkaConfig } from "../../../config/env";
import { Role } from "../../../domain/enums/common.enum";
import { PlanName } from "../../../domain/enums/plan.enum";
import { User } from "../../../domain/entities/user.entity";
import { IJWT } from "../../../domain/interfaces/security/IJwt";
import { toAppError } from '../../../shared/error/handleUnknownError';
import { generateId } from "../../../shared/utils/helpers/generateId";
import { EventEnvelope, SendWelcomeEvent } from "../../dtos/kafka.dto";
import { ERROR_CODES, IdType } from '../../../shared/utils/types/enums';
import { AuthResponseBuilder } from '../../services/AuthResponseBuilder';
import { AppError, BadRequestError } from '../../../shared/error/appError';
import { CreditAccount } from "../../../domain/entities/creditAccount.entity";
import { ProviderProfile } from '../../../domain/entities/providerProfile.entity';
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { GoogleAuthOrchestrationInput, GoogleAuthOrchestrationOutput } from "../../dtos/auth.dto";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { ICreditAccountRepository } from "../../../domain/interfaces/repositories/ICreditAccount.repository";
import { IProviderProfileRepository } from '../../../domain/interfaces/repositories/IProviderProfile.repository';

export class GoogleAuthOrchestratorUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly providerProfileRepository: IProviderProfileRepository,
        private readonly jwtService: IJWT,
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly authResponseBuilder: AuthResponseBuilder,
        private readonly creditAccountRepository: ICreditAccountRepository
    ) { };

    async execute(input: GoogleAuthOrchestrationInput): Promise<GoogleAuthOrchestrationOutput> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const {
                email,
                googleId,
                name,
                image,

            } = input;

            if (!email || !googleId || !name) {
                throw new AppError(
                    'Invalid Google authentication payload',
                    400,
                    true,
                    ERROR_CODES.INVALID_REQUEST
                );
            }

            let user: User | null = await this.userRepository.findByGoogleId(googleId);
            if (!user) {
                user = await this.userRepository.findByEmail(email);
            }

            let isNewUser = false;
            if (!user) {
                isNewUser = true;

                const referralCode = generateId({
                    type: IdType.REFERRAL,
                    options: { name }
                });

                const userData = User.createGoogle({
                    username: name,
                    email,
                    googleId,
                    profileImage: image ?? "",
                    referralCode
                });

                user = await this.userRepository.create(userData, session);
                if (!user) {
                    throw new AppError(
                        "Failed to create Google user account",
                        500,
                        true,
                        ERROR_CODES.INTERNAL_ERROR
                    );
                }

                const creditAccount = await this.creditAccountRepository.create(
                    CreditAccount.create({ userId: user._id }),
                    session
                );

                if (!creditAccount) {
                    throw new AppError(
                        "Failed to initialize user credit account",
                        500,
                        true,
                        ERROR_CODES.INTERNAL_ERROR
                    );
                }
            } else if (!user.googleId) {
                user.linkGoogleAccount({
                    googleId: googleId,
                    googleConnected: true,
                });
                await this.userRepository.update(user, session);
            }

            await session.commitTransaction();
            session.endSession();

            if (isNewUser) {
                await this.kafkaProducer.publish<EventEnvelope<SendWelcomeEvent>>(
                    kafkaConfig.topics.pub.registerSuccess,
                    {
                        eventId: generateId({ type: IdType.EVENT }),
                        attempt: 1,
                        maxAttempts: 1,
                        occurredAt: new Date().toISOString(),
                        payload: {
                            emailData: {
                                email,
                                name,
                                role: user.role,
                            },
                        }
                    }
                ).catch((err) => {
                    console.error("Failed to publish welcome event to Kafka:", err);
                });
            }

            const token = await this.jwtService.generateToken({
                email: user.email,
                role: user.role,
                userId: user._id,
                name: user.username
            });

            let providerProfile: ProviderProfile | null = null;
            let providerSubscription: PlanName = PlanName.NO_SUBSCRIPTION;
            const isProviderFlow = user.onboardingType === Role.PROVIDER;

            if (isProviderFlow) {
                providerProfile = await this.providerProfileRepository.findByUserId(user._id);
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
                            providerSubscription,
                        ),
                    },
                };
            }

            return {
                token,
                user: {
                    ...baseUser,
                },
            };
        } catch (error: unknown) {
            await session.abortTransaction();
            throw toAppError(error, "Failed to verify otp");
        } finally {
            session.endSession();
        }
    }
}