import { ApiPaginationRequest, ApiResponse } from "../../../infrastructure/dtos/common.dto";
import { AdminFetchAllSubscriptionsResponse } from "../../../infrastructure/dtos/admin.dto";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";

export class AdminFetchAllSubscriptionsUseCase {
    constructor(
        private subscriptionRepository: ISubscriptionRepository,
    ) { }

    async execute(payload: ApiPaginationRequest): Promise<ApiResponse<AdminFetchAllSubscriptionsResponse>> {
        try {
            const result = await this.subscriptionRepository.findAllSubscriptions(payload);
            if (!result) throw new Error("Subscriptions fetching failed, ");
            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("AdminFetchAllSubscriptionsUseCase error : ", error);
            throw new Error("Failed to fetch all subscirptions");
        }
    }
}