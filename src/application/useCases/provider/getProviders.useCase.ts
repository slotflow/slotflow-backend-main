import { AdiminFetchAllProviders } from "../../dtos/admin.dto";
import { ApiPaginationRequest, TableData } from "../../dtos/common.dto";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { log } from "../../../shared/logger/logger";

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
