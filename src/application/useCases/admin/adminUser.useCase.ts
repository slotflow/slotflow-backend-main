import {
    AdminFetchAllUsers,
    AdminFetchUserProfileDetailsRequest,
    AdminFetchUserProfileDetailsResponse,
    AdminChangeUserIsBlockedStatusRequest,
    AdminChangeUserIsBlockedStatusResponse,
} from "../../dtos/admin.dto";
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { IUserQueries } from "../../queries/IUser.queries";
import { SendAccountBlockStatusEvent } from "../../dtos/kafka.dtos";
import { ApiPaginationRequest, TableData } from "../../dtos/common.dto";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/message/IKafkaProducerAdapter";

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
        private kafkaProducer: IKafkaProducerAdapter
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

            await this.kafkaProducer.publish<SendAccountBlockStatusEvent>(kafkaConfig.topics.pub.accountBlockStatus, {
                userId,
                blocked: updatedUser.isBlocked,
                email: user.email,
                name: user.username
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
