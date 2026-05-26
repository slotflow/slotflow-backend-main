import mongoose from "mongoose";
import { Role } from "../../../domain/enums/common.enum";
import { generateId } from "../../../shared/utils/generateId";
import { ERROR_CODES, IdType } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { CreditAccount } from "../../../domain/entities/creditAccount.entity";
import { CreditTransaction } from "../../../domain/entities/creditTransaction.entity";
import { IServiceAvailabilityQueries } from "../../queries/IServiceAvailability.queries";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { IReferralRepository } from "../../../domain/interfaces/repositories/IReferral.repository";
import { UpdateBookingOnlineTrackInput, UpdateBookingOnlineTrackOutput } from "../../dtos/booking.dto";
import { ICreditAccountRepository } from "../../../domain/interfaces/repositories/ICreditAccount.repository";
import { ICreditTransactionRepository } from "../../../domain/interfaces/repositories/ICreditTransaction.repository";
import { CreditTransactionSource, CreditTransactionType, RewardPoints } from "../../../domain/enums/creditTransaction.enum";

export class UpdateBookingOnlineTrakingUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly serviceAvailabilityQueries: IServiceAvailabilityQueries,
        private readonly userRepository: IUserRepository,
        private readonly referralRepository: IReferralRepository,
        private readonly creditAccountRepository: ICreditAccountRepository,
        private readonly creditTransactionRepository: ICreditTransactionRepository
    ) { };

    async execute(input: UpdateBookingOnlineTrackInput): Promise<UpdateBookingOnlineTrackOutput> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { joined, joinedTime, leftCallTime, role, roomId } = input;

            if (joined && (!joinedTime && !leftCallTime)) {
                throw new BadRequestError();
            }

            if (!role || !roomId) {
                throw new BadRequestError();
            }

            const booking = await this.bookingRepository.findByRoomId(roomId, session);
            if (!booking) {
                throw new NotFoundError(
                    "Booking not found",
                    ERROR_CODES.BOOKING_NOT_FOUND
                );
            }

            const serviceAvailability = await this.serviceAvailabilityQueries.findByProviderId({ date: new Date(), providerId: booking.serviceProviderId });
            if (!serviceAvailability) {
                throw new NotFoundError(
                    "Service not found",
                    ERROR_CODES.SERVICE_NOT_FOUND
                );
            }

            if (role === Role.PROVIDER) {
                if (joined && joinedTime) {
                    if (!booking.onlineTrack.provider.joined && booking.onlineTrack.provider.joinedTime) {
                        booking.onlineTrack.provider.joined = true;
                        booking.onlineTrack.provider.joinedTime = joinedTime;
                    }
                } else if (joined && leftCallTime) {
                    booking.onlineTrack.provider.leftCallTime = leftCallTime;
                    if (booking.onlineTrack.user.joined) {
                        if (booking.onlineTrack.user.joinedTime && booking.onlineTrack.user.leftCallTime) {
                            booking.completeAppointment();
                        };
                    };
                };
            } else if (role === Role.USER) {
                if (joined && joinedTime) {
                    if (!booking.onlineTrack.user.joined && !booking.onlineTrack.user.joinedTime) {
                        booking.onlineTrack.user.joined = true;
                        booking.onlineTrack.user.joinedTime = joinedTime;
                    }
                } else if (joined && leftCallTime) {
                    booking.onlineTrack.user.leftCallTime = leftCallTime;
                    if (booking.onlineTrack.provider.joined) {
                        if (booking.onlineTrack.provider.joinedTime && booking.onlineTrack.provider.leftCallTime) {
                            booking.completeAppointment();
                        };
                    };
                };
            };

            const updatedBooking = await this.bookingRepository.update(booking, session);
            if (!updatedBooking) {
                throw new AppError(
                    "Internal server error",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }

            const user = await this.userRepository.findById(booking.userId, session);
            if(!user) {
                throw new AppError(
                    "Internal server error",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }

            if (user.referredBy) {
                const referral = await this.referralRepository.findByReferrerAndReferredUser(user.referredBy, user._id);
                if (referral && !referral.rewardGiven) {
                    referral.completeReferral();
                    await this.referralRepository.update(referral, session);

                    let creditAccount = await this.creditAccountRepository.findByUserId(user._id, session);
                    if (!creditAccount) {
                        creditAccount = await this.creditAccountRepository.create(CreditAccount.create({ userId: user._id }), session);
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
                        user._id,
                        RewardPoints.BOOKING,
                        session
                    );

                    const updatedAccount = await this.creditAccountRepository.findByUserId(user._id, session);

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
                        credits: RewardPoints.BOOKING,
                        source: CreditTransactionSource.SUBSCRIPTION_DISCOUNT,
                        type: CreditTransactionType.CREDIT,
                        userId: user._id,
                        idempotencyKey: generateId({ type: IdType.CREDIT_TRANSACTION }),
                        referenceId: booking._id
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

            await session.commitTransaction();
            return { duration: serviceAvailability.duration };
        } catch (error: unknown) {
            await session.abortTransaction();
            throw toAppError(error, "Failed to update booking");
        } finally {
            session.endSession();
        };
    };
};