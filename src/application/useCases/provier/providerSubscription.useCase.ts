import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";
import { ApiResponse, FetchProviderSubscriptionsRequest, FindSubscriptionsByProviderIdResponse } from "../../dtos/common.dto";

export class ProviderFetchAllSubscriptionsUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private subscriptionRepository: ISubscriptionRepository,
    ) { }

    async execute(payload: FetchProviderSubscriptionsRequest): Promise<ApiResponse<FindSubscriptionsByProviderIdResponse>> {
        try {
            const { providerId, page, limit } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("Invalid request.");

            const result = await this.subscriptionRepository.findSubscriptionsByProviderId({ providerId, page, limit });
            if (!result) throw new Error("Subscriptions fetching error.");

            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("ProviderFetchAllSubscriptionsUseCase error : ", error);
            throw new Error("Failed to fetch all subscriptions");
        }
    }
}