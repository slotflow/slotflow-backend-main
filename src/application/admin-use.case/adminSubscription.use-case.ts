import { ApiPaginationRequest, ApiResponse } from "../../infrastructure/dtos/common.dto";
import { AdminFetchAllSubscriptionsResponse } from "../../infrastructure/dtos/admin.dto";
import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";

export class AdminFetchAllSubscriptionsUseCase {
    constructor(
        private subscriptionRepositoryImpl: SubscriptionRepositoryImpl,
    ) { }

    async execute(payload: ApiPaginationRequest): Promise<ApiResponse<AdminFetchAllSubscriptionsResponse>> {
        try {
            const result = await this.subscriptionRepositoryImpl.findAllSubscriptions(payload);
            if (!result) throw new Error("Subscriptions fetching failed, ");
            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("AdminFetchAllSubscriptionsUseCase error : ", error);
            throw new Error("Failed to fetch all subscirptions");
        }
    }
}