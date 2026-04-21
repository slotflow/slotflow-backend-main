import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { ERROR_CODES } from '../../../shared/utils/types';
import { TrialSubscriptionInput } from '../../dtos/subscription.dto';
import { toAppError } from '../../../shared/error/handleUnknownError';
import { notificationContentMap } from "../../../shared/utils/constants";
import { Subscription } from "../../../domain/entities/subscription.entity";
import { EventEnvelope, SendProviderTrialSubscriptionEvent } from "../../dtos/kafka.dto";
import { AppError, BadRequestError, NotFoundError } from '../../../shared/error/appError';
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { IUserRepository } from '../../../domain/interfaces/repositories/IUser.repository';
import { SubscriptionStatus, SubscriptionValidity } from "../../../domain/enums/subscription.enum";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { getDateAfterDays, getUtcDateRange, isSubscriptionExpired } from "../../../shared/utils/dateTime";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";
import { IProviderProfileRepository } from '../../../domain/interfaces/repositories/IProviderProfile.repository';

export class TrialSubscriptionUseCase {
    constructor(
        private userRepository: IUserRepository,
        private providerProfileRepository: IProviderProfileRepository,
        private subscriptionRepository: ISubscriptionRepository,
        private planRepository: IPlanRepository,
        private kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(input: TrialSubscriptionInput): Promise<void> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { providerId } = input;
            if (!providerId) {
                throw new BadRequestError();
            }

            const provider = await this.userRepository.findById(providerId);
            if (!provider) {
                throw new NotFoundError(
                    "User not found.",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            const providerProfile = await this.providerProfileRepository.findByUserId(providerId);
            if (!providerProfile) {
                throw new NotFoundError(
                    "Profile not found.",
                    ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND
                );
            }

            const providerSubscriptions = providerProfile.subscription;
            if (providerSubscriptions.length > 0) {
                const providerLastSubscriptionId = providerSubscriptions.pop();
                const subscription = await this.subscriptionRepository.findById(providerLastSubscriptionId!);
                if (subscription) {
                    const isExpired = isSubscriptionExpired(subscription.endDate);
                    if (!isExpired) {
                        throw new BadRequestError(
                            "Your current subscription is on live.",
                            ERROR_CODES.SUBSCRIPTION_ALREADY_LIVE
                        );
                    }
                }
            };

            const trialPlan = await this.planRepository.findByNameOrPrice("TRIAL", 0);
            if (!trialPlan) {
                throw new NotFoundError(
                    "No trial plan found.",
                    ERROR_CODES.PLAN_NOT_FOUND
                );
            }

            const trialPlanId = trialPlan._id;
            const alreadyUsedTrial = providerSubscriptions.some(
                (id) => id.toString() === trialPlanId.toString()
            );
            if (alreadyUsedTrial) {
                throw new BadRequestError(
                    "Trial already used. Please choose a paid plan.",
                    ERROR_CODES.SUBSCRIPTION_ALREADY_LIVE
                );
            }

            const subscriptionData = Subscription.create({
                providerId,
                subscriptionPlanId: trialPlanId,
                startDate: new Date(),
                endDate: getDateAfterDays(SubscriptionValidity.SEVEN_DAYS),
                subscriptionStatus: SubscriptionStatus.ACTIVE,
            });

            const subscription = await this.subscriptionRepository.create(subscriptionData, session);
            if (!subscription) {
                throw new AppError(
                    "Failed to create subscription",
                    500,
                    true,
                    ERROR_CODES.DB_CONNECTION_FAILED
                );
            }

            providerProfile.pushSubscriptionId(subscription._id);
            const updatedProfile = await this.providerProfileRepository.update(providerProfile, session);
            if (!updatedProfile) {
                throw new AppError(
                    "Failed to update provider profile",
                    500,
                    true,
                    ERROR_CODES.DB_CONNECTION_FAILED
                );
            }

            const { startDate, endDate } = getUtcDateRange(subscription.startDate, subscription.endDate);

            await this.kafkaProducer.publish<EventEnvelope<SendProviderTrialSubscriptionEvent>>(kafkaConfig.topics.pub.providerTrialSubscription, {
                eventId: uuidv4(),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toISOString(),
                payload: {
                    emailData: {
                        email: provider.email,
                        name: provider.username,
                        startDate,
                        endDate,
                    },
                    notificationData: {
                        userId: provider._id,
                        pushNotification: false,
                        title: notificationContentMap.providerTrialSubscription.title,
                        body: notificationContentMap.providerTrialSubscription.body(),
                    }
                }
            });
            session.commitTransaction();
        } catch (error: unknown) {
            await session.abortTransaction();
            throw toAppError(error, "Failed to activate trail subscription");
        } finally {
            session.endSession()
        }
    };
};