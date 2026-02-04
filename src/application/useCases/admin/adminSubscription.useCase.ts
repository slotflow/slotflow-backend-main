import { log } from "../../../shared/logger/logger";
import { ApiPaginationRequest, TableData } from "../../dtos/common.dto";
import { AdminFetchAllSubscriptionsResponse } from "../../dtos/admin.dto";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";

export class AdminFetchAllSubscriptionsUseCase {
    constructor(
        private subscirptionQueries: ISubscriptionQueries
    ) { };

    async execute(payload: ApiPaginationRequest): Promise<TableData<AdminFetchAllSubscriptionsResponse>> {
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
            log.error("AdminFetchAllSubscriptionsUseCase failed", error as Error);
            throw error;
        };
    };
};