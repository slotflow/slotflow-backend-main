import { log } from "../../../shared/logger/logger";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";
import { GetSubscriptionsRequest, GetSubscriptionsResponse, TableData } from "../../dtos/common.dto";

export class GetSubscriptionsUseCase {
    constructor(
        private subscirptionQueries: ISubscriptionQueries
    ) { };

    async execute(payload: GetSubscriptionsRequest): Promise<TableData<GetSubscriptionsResponse>> {
        try {
            const result = await this.subscirptionQueries.findAll(payload);
            const { data: subscriptions, currentPage, totalCount, totalPages } = result;
            return {
                data: subscriptions,
                totalPages,
                currentPage,
                totalCount,
            };
        } catch (error) {
            log.error("GetSubscriptionsUseCase failed", error as Error);
            throw error;
        };
    };
};