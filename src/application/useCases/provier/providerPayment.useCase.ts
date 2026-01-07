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

            console.log("payments : ",payments);

            return { 
                data: payments.map(payment => ({
                    _id: payment._id,
                    createdAt: payment.createdAt,
                    totalAmount: payment.totalAmount,
                    paymentFor: payment.paymentFor,
                    paymentGateway: payment.paymentGateway,
                    paymentStatus: payment.paymentStatus,
                    paymentMethod: payment.paymentMethod,
                    discountAmount: payment.discountAmount
                })), 
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