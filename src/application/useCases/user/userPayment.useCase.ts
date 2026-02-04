import { log } from "../../../shared/logger/logger";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { FetchPaymentResponse, FetchPaymentsRequest, TableData } from "../../dtos/common.dto";

export class UserFetchAllPaymentsUseCase {
    constructor(
        private userRepository: IUserRepository,
        private paymentRepository: IPaymentRepository,
    ) { };

    async execute(payload: FetchPaymentsRequest): Promise<TableData<FetchPaymentResponse>> {
        try {
            const { userId, page, limit } = payload;
            if (!userId) throw new Error("Invalid request");

            const provider = await this.userRepository.findById(userId);
            if (!provider) throw new Error("No user found.");

            const result = await this.paymentRepository.findAll(page, limit, userId);
            const { data: payments, currentPage, totalCount, totalPages } = result;
            return { 
                data: payments.map(payment => ({
                    _id: payment._id,
                    createdAt: payment.createdAt,
                    discountAmount: payment.discountAmount,
                    paymentFor: payment.paymentFor,
                    paymentGateway: payment.paymentGateway,
                    paymentMethod: payment.paymentMethod,
                    paymentStatus: payment.paymentStatus,
                    totalAmount: payment.totalAmount
                })), 
                totalPages, 
                currentPage, 
                totalCount,
            };
        } catch (error) {
            log.error("UserFetchAllPaymentsUseCase failed ", error as Error);
            throw error;
        };
    };
};
