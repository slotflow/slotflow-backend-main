import {
    AdiminFetchAllProviders,
    AdminApproveProviderRequest,
    AdminChangeProviderStatusRequest,
    AdminChangeProviderTrustTagRequest,
    AdminRejectProviderRequest,
} from "../../dtos/admin.dto";
import { ApiPaginationRequest, ApiResponse } from "../../dtos/common.dto";
import { adminVerificationStatusArray } from "../../../shared/utils/constants";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";


export class AdminProviderListUseCase {
    constructor(
        private providerRepository: IProviderRepository
    ) { }

    async execute(payload: ApiPaginationRequest): Promise<ApiResponse<AdiminFetchAllProviders>> {
        try {
            const result = await this.providerRepository.findAllProviders(payload);
            if (!result) throw new Error("Providers fetching failed");

            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("AdminProviderListUseCase: ", error);
            throw new Error("Failed to fetch providers list");
        }
    }
}


export class AdminApproveProviderUseCase {
    constructor(
        private providerRepository: IProviderRepository
    ) { }

    async execute(payload: AdminApproveProviderRequest): Promise<ApiResponse> {
        try {
            const { providerId } = payload;

            const provider = await this.providerRepository.findProviderById(providerId);
            if (!provider) throw new Error("User not found.");
            if (provider.isAdminVerified) throw new Error("Provider is already verified.");

            provider.isAdminVerified = true;
            provider.verificationRejectionReason = null;
            provider.adminVerificationStatus = adminVerificationStatusArray[2];

            const updatedProvider = await this.providerRepository.updateProvider(provider);
            if (!updatedProvider) throw new Error("Provider not found");

            //TODO SEND EMAIL

            return { success: true, message: "Provider approved successfully." };
        } catch (error) {
            console.log("AdminApproveProviderUseCase: ", error);
            throw new Error("Failed to approve provider");
        }
    }
}


export class AdminRejectProviderUseCase {
    constructor(
        private providerRepository: IProviderRepository
    ) { }

    async execute(payload: AdminRejectProviderRequest): Promise<ApiResponse> {
        try {
            const { providerId, verificationRejectionReason, isAddressVerified, isAvailabilityVerified, isProofsVerified, isServiceDetailsVerified } = payload;

            const provider = await this.providerRepository.findProviderById(providerId);
            if (!provider) throw new Error("User not found.");

            provider.isAdminVerified = false;
            provider.adminVerificationStatus = adminVerificationStatusArray[3];
            provider.verificationRejectionReason = verificationRejectionReason;
            provider.isAddressVerified = isAddressVerified;
            provider.isServiceDetailsVerified = isServiceDetailsVerified;
            provider.isAvailabilityVerified = isAvailabilityVerified;
            provider.isProofsVerified = isProofsVerified;

            const updatedProvider = await this.providerRepository.updateProvider(provider);
            if (!updatedProvider) throw new Error("Provider not found");

            //TODO SEND EMAIL

            return { success: true, message: "Provider rejected successfully." };
        } catch (error) {
            console.log("AdminRejectProviderUseCase: ", error);
            throw new Error("Failed to reject provider");
        }
    }
}


export class AdminChangeProviderBlockStatusUseCase {
    constructor(
        private providerRepository: IProviderRepository
    ) { }

    async execute(payload: AdminChangeProviderStatusRequest): Promise<ApiResponse> {
        try {
            const { providerId, isBlocked } = payload;

            const provider = await this.providerRepository.findProviderById(providerId);
            if (!provider) throw new Error("User not found.");
            
            provider.isBlocked = !isBlocked;

            const updatedProvider = await this.providerRepository.updateProvider(provider);
            if (!updatedProvider) throw new Error("Provider not found");

            //TODO SEND EMAIL

            return { success: true, message: `Provider ${isBlocked ? "Unblocked" : "blocked"} successfully.` };
        } catch (error) {
            console.log("AdminChangeProviderBlockStatusUseCase: ", error);
            throw new Error("Failed to change provider block status");
        }
    }
}


export class AdminChangeProviderTrustTagUseCase {
    constructor(
        private providerRepository: IProviderRepository
    ) { }

    async execute(payload: AdminChangeProviderTrustTagRequest): Promise<ApiResponse> {
        try {
            const { providerId, trustedBySlotflow } = payload;

            const provider = await this.providerRepository.findProviderById(providerId);
            if (!provider) throw new Error("User not found.");

            provider.trustedBySlotflow = !trustedBySlotflow;

            const updatedProvider = await this.providerRepository.updateProvider(provider);
            if (!updatedProvider) throw new Error("Provider not found");

            //TODO SEND EMAIL
            
            return { success: true, message: `Provider trust tag ${trustedBySlotflow ? "Given" : "Removed"} successfully.` };
        } catch (error) {
            console.log("AdminChangeProviderTrustTagUseCase: ", error);
            throw new Error("Failed to change provider trust tag status");
        }
    }
}


