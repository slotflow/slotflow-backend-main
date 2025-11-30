import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { ApiResponse, FetchPaymentResponse, FetchPaymentsRequest } from "../../infrastructure/dtos/common.dto";


export class ProviderFetchAllPaymentsUseCase {
    constructor(
        private providerRepositoryImpl: ProviderRepositoryImpl,
        private paymentRepositoryImpl: PaymentRepositoryImpl,
    ) { }

    async execute(payload: FetchPaymentsRequest): Promise<ApiResponse<FetchPaymentResponse>> {
        try {
            const { providerId, page, limit } = payload;
            if (!providerId) throw new Error("Invalid request.");

            const provider = await this.providerRepositoryImpl.findProviderById(providerId);
            if (!provider) throw new Error("No user found.");

            const result = await this.paymentRepositoryImpl.findAllPayments({ page, limit, providerId: providerId });
            if (!result) throw new Error("Payments fetching error.");

            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("ProviderFetchAllPaymentsUseCase error : ", error);
            throw new Error("Failed to fetch all payments");
        }
    }
}