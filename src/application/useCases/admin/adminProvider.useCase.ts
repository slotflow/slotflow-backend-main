import {
    AdiminFetchAllProviders,
    AdminRejectProviderRequest,
    AdminApproveProviderRequest,
    AdminChangeProviderTrustTagRequest,
    AdminChangeProviderTrustTagResponse,
    AdminChangeProviderBlockStatusRequest,
    AdminChangeProviderBlockStatusResponse,
} from "../../dtos/admin.dto";
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { ApiPaginationRequest, TableData } from "../../dtos/common.dto";
import { ICacheService } from "../../../domain/interfaces/services/ICache.service";
import { AdminVerificationStatus } from "../../../domain/enums/adminVerificationStatus.enum";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/message/IKafkaProducerAdapter";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { SendAccountBlockStatusEvent, SendAccountTrustStatusEvent, SendAdminProviderReviewEvent } from "../../dtos/kafka.dtos";

export class AdminProviderListUseCase {
    constructor(
        private providerRepository: IProviderRepository
    ) { };

    async execute(payload: ApiPaginationRequest): Promise<TableData<AdiminFetchAllProviders>> {
        try {
            const { page, limit } = payload;
            const result = await this.providerRepository.findAll(page, limit);
            const { data: providers, currentPage, totalCount, totalPages } = result;
            return {
                data: providers.map(provider => ({
                    _id: provider._id,
                    adminVerificationStatus: provider.adminVerificationStatus,
                    email: provider.email,
                    isAdminVerified: provider.isAdminVerified,
                    isBlocked: provider.isBlocked,
                    isEmailVerified: provider.isEmailVerified,
                    trustedBySlotflow: provider.trustedBySlotflow,
                    username: provider.username
                })),
                totalPages,
                currentPage,
                totalCount,
            };
        } catch (error) {
            log.error("AdminProviderListUseCase failed", error as Error);
            throw error;
        };
    };
};


export class AdminApproveProviderUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(payload: AdminApproveProviderRequest): Promise<void> {
        try {
            const { providerId } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");
            if (provider.isAdminVerified) throw new Error("Provider is already verified.");

            provider.approveVerification();

            await this.providerRepository.update(provider);

            await this.kafkaProducer.publish<SendAdminProviderReviewEvent>(kafkaConfig.topics.pub.adminProviderReview, {
                email: provider.email,
                name: provider.username,
                status: AdminVerificationStatus.APPROVED,
            });

        } catch (error) {
            log.error("AdminApproveProviderUseCase failed", error as Error);
            throw error;
        };
    };
};


export class AdminRejectProviderUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(payload: AdminRejectProviderRequest): Promise<void> {
        try {
            const { providerId, verificationRejectionReason, isAddressVerified, isAvailabilityVerified, isProofsVerified, isServiceDetailsVerified } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            provider.rejectVerification({
                verificationRejectionReason: verificationRejectionReason ?? "",
                isAddressVerified,
                isServiceDetailsVerified,
                isAvailabilityVerified,
                isProofsVerified,
            });

            await this.providerRepository.update(provider);

            await this.kafkaProducer.publish<SendAdminProviderReviewEvent>(kafkaConfig.topics.pub.adminProviderReview, {
                email: provider.email,
                name: provider.username,
                status: AdminVerificationStatus.REJECTED,
                reason: provider.verificationRejectionReason ?? undefined
            });

        } catch (error) {
            log.error("AdminRejectProviderUseCase failed", error as Error);
            throw error;
        };
    };
};


export class AdminChangeProviderBlockStatusUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private kafkaProducer: IKafkaProducerAdapter,
        private cacheService: ICacheService
    ) { };

    async execute(payload: AdminChangeProviderBlockStatusRequest): Promise<AdminChangeProviderBlockStatusResponse> {
        try {
            const { providerId, isBlocked } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            if (provider.isBlocked === isBlocked) {
                isBlocked ? provider.unblock() : provider.block();
            };

            const updatedProvider = await this.providerRepository.update(provider);
            if (!updatedProvider) throw new Error("Provider not found");

            if(updatedProvider.isBlocked) {   
                await this.cacheService.setBlockList(providerId,JSON.stringify(isBlocked));
            } else {
                await this.cacheService.deleteBlockList(providerId);
            };

            await this.kafkaProducer.publish<SendAccountBlockStatusEvent>(kafkaConfig.topics.pub.accountBlockStatus, {
                email: provider.email,
                name: provider.username,
                blocked: updatedProvider.isBlocked,
                userId: provider._id
            });

            return { providerId, isBlocked: updatedProvider.isBlocked };
        } catch (error) {
            log.error("AdminChangeProviderBlockStatusUseCase failed", error as Error);
            throw error;
        };
    };
};


export class AdminChangeProviderTrustTagUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(payload: AdminChangeProviderTrustTagRequest): Promise<AdminChangeProviderTrustTagResponse> {
        try {
            const { providerId, trustedBySlotflow } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            if (provider.trustedBySlotflow === trustedBySlotflow) {
                trustedBySlotflow ? provider.revokeTrustBadge() : provider.grantTrustBadge();
            };

            const updatedProvider = await this.providerRepository.update(provider);
            if (!updatedProvider) throw new Error("Provider not found");

            await this.kafkaProducer.publish<SendAccountTrustStatusEvent>(kafkaConfig.topics.pub.accountTrustStatus, {
                email: provider.email,
                name: provider.username,
                trusted: updatedProvider.trustedBySlotflow,
                providerId: provider._id
            });

            return { providerId, trustedBySlotflow: updatedProvider.trustedBySlotflow };
        } catch (error) {
            log.error("AdminChangeProviderTrustTagUseCase failed", error as Error);
            throw error;
        };
    };
};

// TODO ADMIN PAYOUT WITH EMAIL THROUGH KAFKA


