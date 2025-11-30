import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";
import { ApiResponse, FetchProviderSubscriptionsRequest, FindSubscriptionsByProviderIdResponse } from "../../infrastructure/dtos/common.dto";

export class ProviderFetchAllSubscriptionsUseCase {
    constructor(
        private providerRepositoryImpl: ProviderRepositoryImpl,
        private subscriptionRepositoryImpl: SubscriptionRepositoryImpl,
    ) { }

    async execute(payload: FetchProviderSubscriptionsRequest): Promise<ApiResponse<FindSubscriptionsByProviderIdResponse>> {
        try {
            const { providerId, page, limit } = payload;

            const provider = await this.providerRepositoryImpl.findProviderById(providerId);
            if (!provider) throw new Error("Invalid request.");

            const result = await this.subscriptionRepositoryImpl.findSubscriptionsByProviderId({ providerId, page, limit });
            if (!result) throw new Error("Subscriptions fetching error.");

            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("ProviderFetchAllSubscriptionsUseCase error : ", error);
            throw new Error("Failed to fetch all subscriptions");
        }
    }
}