import {
    AdiminFetchAllProviders,
    AdminApproveProviderRequest,
    AdminChangeProviderStatusRequest,
    AdminChangeProviderTrustTagRequest,
} from "../../../infrastructure/dtos/admin.dto";
import { OTPService } from "../../../infrastructure/services/otp.service";
import { ApiPaginationRequest, ApiResponse } from "../../../infrastructure/dtos/common.dto";
import { ProviderRepositoryImpl } from "../../../infrastructure/database/provider/provider.repository.impl";


export class AdminProviderListUseCase {
    constructor(private providerRepositoryImpl: ProviderRepositoryImpl) { }

    async execute(payload: ApiPaginationRequest): Promise<ApiResponse<AdiminFetchAllProviders>> {
        try {
            const result = await this.providerRepositoryImpl.findAllProviders(payload);
            if (!result) throw new Error("Providers fetching failed");

            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("AdminProviderListUseCase: ", error);
            throw new Error("Failed to fetch providers list");
        }
    }
}


export class AdminApproveProviderUseCase {
    constructor(private providerRepositoryImpl: ProviderRepositoryImpl) { }

    async execute(payload: AdminApproveProviderRequest): Promise<ApiResponse> {
        try {
            const { providerId } = payload;

            const provider = await this.providerRepositoryImpl.findProviderById(providerId);
            if (!provider) throw new Error("User not found.");
            if (provider.isAdminVerified) throw new Error("Provider is already verified.");

            provider.isAdminVerified = true;
            const updatedProvider = await this.providerRepositoryImpl.updateProvider(provider);
            if (!updatedProvider) throw new Error("Provider not found");

            await OTPService.sendApprovalEmail(updatedProvider.email);

            return { success: true, message: "Provider approved successfully." };
        } catch (error) {
            console.log("AdminApproveProviderUseCase: ", error);
            throw new Error("Failed to approve provider");
        }
    }
}


export class AdminChangeProviderBlockStatusUseCase {
    constructor(private providerRepositoryImpl: ProviderRepositoryImpl) { }

    async execute(payload: AdminChangeProviderStatusRequest): Promise<ApiResponse> {
        try {
            const { providerId, isBlocked } = payload;

            const provider = await this.providerRepositoryImpl.findProviderById(providerId);
            if (!provider) throw new Error("User not found.");
            
            provider.isBlocked = !isBlocked;

            const updatedProvider = await this.providerRepositoryImpl.updateProvider(provider);
            if (!updatedProvider) throw new Error("Provider not found");

            return { success: true, message: `Provider ${isBlocked ? "Unblocked" : "blocked"} successfully.` };
        } catch (error) {
            console.log("AdminChangeProviderBlockStatusUseCase: ", error);
            throw new Error("Failed to change provider block status");
        }
    }
}


export class AdminChangeProviderTrustTagUseCase {
    constructor(private providerRepositoryImpl: ProviderRepositoryImpl) { }

    async execute(payload: AdminChangeProviderTrustTagRequest): Promise<ApiResponse> {
        try {
            const { providerId, trustedBySlotflow } = payload;

            const provider = await this.providerRepositoryImpl.findProviderById(providerId);
            if (!provider) throw new Error("User not found.");

            provider.trustedBySlotflow = !trustedBySlotflow;

            const updatedProvider = await this.providerRepositoryImpl.updateProvider(provider);
            if (!updatedProvider) throw new Error("Provider not found");
            
            return { success: true, message: `Provider trust tag ${trustedBySlotflow ? "Given" : "Removed"} successfully.` };
        } catch (error) {
            console.log("AdminChangeProviderTrustTagUseCase: ", error);
            throw new Error("Failed to change provider trust tag status");
        }
    }
}


