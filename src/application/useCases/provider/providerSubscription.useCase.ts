import { log } from "../../../shared/logger/logger";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { FetchProviderSubscriptionsRequest, FindSubscriptionsByProviderIdResponse, TableData } from "../../dtos/common.dto";

export class ProviderFetchAllSubscriptionsUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private subscriptionQueries: ISubscriptionQueries,
    ) { };

    async execute(payload: FetchProviderSubscriptionsRequest): Promise<TableData<FindSubscriptionsByProviderIdResponse>> {
        try {
            const { providerId, page, limit } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("Invalid request.");

            const result = await this.subscriptionQueries.findByProviderId({ providerId, page, limit });
            const { data: subscriptions, currentPage, totalCount, totalPages } = result;

            return { 
                data: subscriptions, 
                totalPages, 
                currentPage, 
                totalCount,
            };
        } catch (error) {
            log.error("ProviderFetchAllSubscriptionsUseCase failed", error as Error);
            throw error;
        };
    };
};