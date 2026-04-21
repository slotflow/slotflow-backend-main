import { TableData } from "../../dtos/common.dto";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";
import { GetSubscriptionsInput, GetSubscriptionsOutput } from "../../dtos/subscription.dto";

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
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get subscriptions");
        };
    };
};