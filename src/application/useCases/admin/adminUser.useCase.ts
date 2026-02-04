import {
    AdminFetchAllUsers,
    AdminFetchUserProfileDetailsRequest,
    AdminFetchUserProfileDetailsResponse,
    AdminChangeUserIsBlockedStatusRequest,
    AdminChangeUserIsBlockedStatusResponse,
} from "../../dtos/admin.dto";
import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { IUserQueries } from "../../queries/IUser.queries";
import { ApiPaginationRequest, TableData } from "../../dtos/common.dto";
import { notificationContentMap } from "../../../shared/utils/constants";
import { EventEnvelope, SendAccountBlockStatusEvent } from "../../dtos/kafka.dtos";
import { ICacheService } from "../../../domain/interfaces/services/ICache.service";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";

export class AdminUserListUseCase {
    constructor(
        private userQueries: IUserQueries,
    ) { };

    async execute(payload: ApiPaginationRequest): Promise<TableData<AdminFetchAllUsers>> {
        try {
            const result = await this.userQueries.findAll(payload);
            const { data: users, currentPage, totalCount, totalPages } = result;

            return {
                data: users,
                totalPages,
                currentPage,
                totalCount,
            };
        } catch (error) {
            log.error("AdminUserListUseCase failed", error as Error);
            throw error;
        };
    };
};

export class AdminChangeUserBlockStatusUseCase {
    constructor(
        private userRepository: IUserRepository,
        private kafkaProducer: IKafkaProducerAdapter,
        private cacheService: ICacheService
    ) { };

    async execute(payload: AdminChangeUserIsBlockedStatusRequest): Promise<AdminChangeUserIsBlockedStatusResponse> {
        try {
            const { userId, isBlocked } = payload;

            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("No user found.");

            if (user.isBlocked === isBlocked) {
                isBlocked ? user.unblock() : user.block();
            };

            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) throw new Error("User not found");

            if (updatedUser.isBlocked) {
                await this.cacheService.setBlockList(userId, JSON.stringify(isBlocked));
            } else {
                await this.cacheService.deleteBlockList(userId);
            };

            await this.kafkaProducer.publish<EventEnvelope<SendAccountBlockStatusEvent>>(kafkaConfig.topics.pub.accountBlockStatus, {
                eventId: uuidv4(),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toISOString(),
                payload: {
                    emailData: {
                        email: user.email,
                        name: user.username,
                        blocked: updatedUser.isBlocked,
                    },
                    notificationData: {
                        userId: user._id,
                        pushNotification: user.allowPushNotification ?? false,
                        title: notificationContentMap.accountBlockStatus.title,
                        body: notificationContentMap.accountBlockStatus.body(updatedUser.isBlocked),
                    }
                }
            });

            return { userId, isBlocked: updatedUser.isBlocked };
        } catch (error) {
            log.error("AdminChangeUserBlockStatusUseCase failed", error as Error);
            throw error;
        };
    };
};

export class AdminFetchUserDetailsUseCase {
    constructor(
        private userRepository: IUserRepository,
        private signedUrlService: ISignedUrlService
    ) { };

    async execute(payload: AdminFetchUserProfileDetailsRequest): Promise<AdminFetchUserProfileDetailsResponse> {
        try {
            const { userId } = payload;

            const user = await this.userRepository.findById(userId);
            if (!user) return null;

            let signedProfileImage: string | null = null;
            if (user.profileImage) {
                signedProfileImage = await this.signedUrlService.get(user.profileImage);
            };

            return {
                email: user.email,
                isBlocked: user.isBlocked,
                isEmailVerified: user.isEmailVerified,
                phone: user.phone,
                username: user.username,
                profileImage: signedProfileImage,
                createdAt: user.createdAt,
            };
        } catch (error) {
            log.error("AdminFetchUserDetailsUseCase failed", error as Error);
            throw error;
        };
    };
};
