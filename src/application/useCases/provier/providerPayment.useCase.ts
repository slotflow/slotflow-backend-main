import { log } from "../../../shared/logger/logger";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { ApiResponse, FetchPaymentResponse, FetchPaymentsRequest } from "../../dtos/common.dto";

export class ProviderFetchAllPaymentsUseCase {
    constructor(
        private paymentRepository: IPaymentRepository,
    ) { };

    async execute(payload: FetchPaymentsRequest): Promise<ApiResponse<FetchPaymentResponse>> {
        try {
            const { providerId, page, limit } = payload;
            if (!providerId) throw new Error("Invalid request.");

            const result = await this.paymentRepository.findAll(page, limit, undefined, providerId );
            const { data: payments, currentPage, totalCount, totalPages } = result;

            return { 
                data: payments, 
                totalPages, 
                currentPage, 
                totalCount,
            };
        } catch (error) {
            log.error("ProviderFetchAllPaymentsUseCase failed", error as Error);
            throw error;
        };
    };
};