import { TableData } from "../../dtos/common.dto";
import { log } from "../../../shared/logger/logger";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";
import { GetSubscriptionsInput, GetSubscriptionsOutput } from "../../dtos/subscription";

export class GetSubscriptionsUseCase {
    constructor(
        private subscirptionQueries: ISubscriptionQueries
    ) { };

    async execute(input: GetSubscriptionsInput): Promise<TableData<GetSubscriptionsOutput>> {
        try {
            const result = await this.subscirptionQueries.findAll(input);
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