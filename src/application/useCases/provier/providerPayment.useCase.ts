import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ApiResponse, FetchPaymentResponse, FetchPaymentsRequest } from "../../../infrastructure/dtos/common.dto";


export class ProviderFetchAllPaymentsUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private paymentRepository: IPaymentRepository,
    ) { }

    async execute(payload: FetchPaymentsRequest): Promise<ApiResponse<FetchPaymentResponse>> {
        try {
            const { providerId, page, limit } = payload;
            if (!providerId) throw new Error("Invalid request.");

            const provider = await this.providerRepository.findProviderById(providerId);
            if (!provider) throw new Error("No user found.");

            const result = await this.paymentRepository.findAllPayments({ page, limit, providerId: providerId });
            if (!result) throw new Error("Payments fetching error.");

            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("ProviderFetchAllPaymentsUseCase error : ", error);
            throw new Error("Failed to fetch all payments");
        }
    }
}