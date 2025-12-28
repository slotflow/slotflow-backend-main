import {
    AdiminFetchAllProviders,
    AdminRejectProviderRequest,
    AdminApproveProviderRequest,
    AdminChangeProviderStatusRequest,
    AdminChangeProviderStatusResponse,
    AdminChangeProviderTrustTagRequest,
    AdminChangeProviderTrustTagResponse,
} from "../../dtos/admin.dto";
import { log } from "../../../shared/logger/logger";
import { ApiPaginationRequest, TableData } from "../../dtos/common.dto";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";

export class AdminProviderListUseCase {
    constructor(
        private providerRepository: IProviderRepository
    ) { }

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
        }
    }
}


export class AdminApproveProviderUseCase {
    constructor(
        private providerRepository: IProviderRepository
    ) { }

    async execute(payload: AdminApproveProviderRequest): Promise<void> {
        try {
            const { providerId } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");
            if (provider.isAdminVerified) throw new Error("Provider is already verified.");

            provider.approveVerification();

            await this.providerRepository.update(provider);
            //TODO SEND EMAIL

        } catch (error) {
            log.error("AdminApproveProviderUseCase failed", error as Error);
            throw error;
        }
    }
}


export class AdminRejectProviderUseCase {
    constructor(
        private providerRepository: IProviderRepository
    ) { }

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

            //TODO SEND EMAIL

        } catch (error) {
            log.error("AdminRejectProviderUseCase failed", error as Error);
            throw error;
        }
    }
}


export class AdminChangeProviderBlockStatusUseCase {
    constructor(
        private providerRepository: IProviderRepository
    ) { }

    async execute(payload: AdminChangeProviderStatusRequest): Promise<AdminChangeProviderStatusResponse> {
        try {
            const { providerId, isBlocked } = payload; // TODO need to update input DTO

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            if(provider.isBlocked === isBlocked) {
                isBlocked ? provider.unblock() : provider.block();
            };

            const updatedProvider = await this.providerRepository.update(provider);
            if (!updatedProvider) throw new Error("Provider not found");

            //TODO SEND EMAIL

            return { providerId, isBlocked: updatedProvider.isBlocked };
        } catch (error) {
            log.error("AdminChangeProviderBlockStatusUseCase failed", error as Error);
            throw error;
        }
    }
}


export class AdminChangeProviderTrustTagUseCase {
    constructor(
        private providerRepository: IProviderRepository
    ) { }

    async execute(payload: AdminChangeProviderTrustTagRequest): Promise<AdminChangeProviderTrustTagResponse> {
        try {
            const { providerId, trustedBySlotflow } = payload; // TODO need to update input DTO

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            if(provider.trustedBySlotflow === trustedBySlotflow) {
                trustedBySlotflow ? provider.revokeTrustBadge() : provider.grantTrustBadge();
            };

            const updatedProvider = await this.providerRepository.update(provider);
            if (!updatedProvider) throw new Error("Provider not found");

            //TODO SEND EMAIL
            
            return { providerId, trustedBySlotflow: updatedProvider.trustedBySlotflow };
        } catch (error) {
            log.error("AdminChangeProviderTrustTagUseCase failed", error as Error);
            throw error;
        }
    }
}


