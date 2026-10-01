import mongoose from "mongoose";
import { kafkaConfig } from "../../../config/env";
import { formatDate } from "../../../shared/utils/helpers/formatDate";
import { generateId } from '../../../shared/utils/helpers/generateId';
import { toAppError } from "../../../shared/error/handleUnknownError";
import { ERROR_CODES, IdType } from '../../../shared/utils/types/enums';
import { AppError, NotFoundError } from "../../../shared/error/appError";
import { CreditAccount } from "../../../domain/entities/creditAccount.entity";
import { ProviderSubscriptionPaymentSuccessEventInput } from "../../dtos/kafka.dto";
import { CreditTransaction } from "../../../domain/entities/creditTransaction.entity";
import { EventEnvelope, ProviderSubscriptionUpdatedEvent } from "../../dtos/kafka.dto";
import { dateFormats, notificationType } from "../../../shared/utils/constants/constant";
import { IKafkaProducerAdapter } from "../../interfaces/messaging/IKafkaProducer.adapter";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IReferralRepository } from "../../../domain/interfaces/repositories/IReferral.repository";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";
import { ICreditAccountRepository } from "../../../domain/interfaces/repositories/ICreditAccount.repository";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";
import { ICreditTransactionRepository } from "../../../domain/interfaces/repositories/ICreditTransaction.repository";
import { CreditTransactionSource, CreditTransactionType, RewardPoints } from "../../../domain/enums/creditTransaction.enum";

export class UpdateSubscriptionAfterPaymentSuccessUseCase {
    constructor(
        private readonly subscriptionRepository: ISubscriptionRepository,
        private readonly userRepository: IUserRepository,
        private readonly providerProfileRepository: IProviderProfileRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly planRepository: IPlanRepository,
        private readonly referralRepository: IReferralRepository,
        private readonly creditAccountRepository: ICreditAccountRepository,
        private readonly creditTransactionRepository: ICreditTransactionRepository
    ) { };

    async execute(input: ProviderSubscriptionPaymentSuccessEventInput): Promise<void> {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const {
                subscriptionId,
                paymentId,
                isTrial,
                providerId,
                currentPeriodEnd,
                currentPeriodStart,
                cancelAt,
                cancelAtPeriodEnd,
                lastEventAt
            } = input;

            const isTrialBoolean: boolean = isTrial === "true";

            const provider = await this.userRepository.findById(providerId);
            if (!provider) {
                throw new NotFoundError(
                    "Provider not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            const providerProfile = await this.providerProfileRepository.findByUserId(providerId);
            if (!providerProfile) {
                throw new NotFoundError(
                    "Provider profile not found",
                    ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND
                );
            }

            providerProfile.pushSubscriptionId(subscriptionId);
            if(isTrialBoolean) {
                providerProfile.trialUsed();
            }
            
            const updatedProviderProfile = await this.providerProfileRepository.update(providerProfile, session);
            if (!updatedProviderProfile) {
                throw new AppError(
                    "Internal server error.",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }

            const subscription = await this.subscriptionRepository.findById(subscriptionId);
            if (!subscription) {
                throw new NotFoundError(
                    "Subscription not found",
                    ERROR_CODES.SUBSCRIPTION_NOT_FOUND
                );
            }

            const plan = await this.planRepository.findById(subscription.subscribedPlanId);
            if (!plan) {
                throw new NotFoundError(
                    "Plan not found",
                    ERROR_CODES.PLAN_NOT_FOUND
                );
            }

            subscription.subscriptionPaymentSuccess({
                paymentId,
                currentPeriodStart,
                currentPeriodEnd,
                cancelAt,
                cancelAtPeriodEnd,
                lastEventAt
            });

            const updatedSubscription = await this.subscriptionRepository.update(subscription, session);
            if(!updatedSubscription) {
                throw new AppError(
                    'Internal server error',
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }

            if (provider.referredBy) {
                const referral = await this.referralRepository.findByReferrerAndReferredUser(provider.referredBy, provider._id);
                if (referral && !referral.rewardGiven) {
                    referral.completeReferral();
                    await this.referralRepository.update(referral, session);

                    let creditAccount = await this.creditAccountRepository.findByUserId(provider._id, session);
                    if (!creditAccount) {
                        creditAccount = await this.creditAccountRepository.create(CreditAccount.create({ userId: provider._id }), session);
                        if (!creditAccount) {
                            throw new AppError(
                                "Failed to create credit account",
                                500,
                                true,
                                ERROR_CODES.INTERNAL_ERROR
                            )
                        }
                    }

                    await this.creditAccountRepository.incrementBalance(
                        provider._id,
                        RewardPoints.SUBSCRIPTION,
                        session
                    );

                    const updatedAccount = await this.creditAccountRepository.findByUserId(provider._id, session);

                    if (!updatedAccount) {
                        throw new AppError(
                            "Credit account not found after update",
                            500,
                            true,
                            ERROR_CODES.INTERNAL_ERROR
                        );
                    }

                    const newCreditTransaction = await this.creditTransactionRepository.create(CreditTransaction.create({
                        accountId: updatedAccount._id,
                        balanceAfter: updatedAccount.balance,
                        credits: RewardPoints.SUBSCRIPTION,
                        source: CreditTransactionSource.SUBSCRIPTION_DISCOUNT,
                        type: CreditTransactionType.CREDIT,
                        userId: provider._id,
                        idempotencyKey: generateId({ type: IdType.CREDIT_TRANSACTION }),
                        referenceId: subscriptionId
                    }), session);
                    if (!newCreditTransaction) {
                        throw new AppError(
                            "Failed to create credit transation",
                            500,
                            true,
                            ERROR_CODES.INTERNAL_ERROR
                        )
                    }
                }
            }

            await this.kafkaProducer.publish<EventEnvelope<ProviderSubscriptionUpdatedEvent>>(
                kafkaConfig.topics.pub.planSubscribed, {
                eventId: generateId({ type: IdType.EVENT }),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date(),
                payload: {
                    socketData: {
                        userId: provider._id,
                        subscribedPlan: plan.planName,
                        currentPeriodStart: updatedSubscription.currentPeriodStart,
                        currentPeriodEnd: updatedSubscription.currentPeriodEnd,
                        subscriptionStatus: subscription.subscriptionStatus,
                        hasUsedTrial: providerProfile.hasUsedTrial,
                    },
                    emailData: {
                        email: provider.email,
                        name: provider.username,
                        subscribedPlan: plan.planName,
                        isTrial,
                        startDate: formatDate(updatedSubscription.currentPeriodStart, dateFormats.WITH_TIME),
                        endDate: formatDate(updatedSubscription.currentPeriodEnd, dateFormats.WITH_TIME),
                    },
                    notificationData: {
                        userId: provider._id,
                        planName: plan.planName,
                        isTrial,
                        currentPeriodEnd: formatDate(currentPeriodEnd, dateFormats.WITH_TIME),
                        notificationType: notificationType.ACCOUNT_ACTIVITY
                    }
                }
            });
            await session.commitTransaction();
        } catch (error) {
            if (session.inTransaction()) {
                await session.abortTransaction();
            }
            throw toAppError(error, "Failed to update subscription");
        } finally {
            await session.endSession();
        };
    };
};
