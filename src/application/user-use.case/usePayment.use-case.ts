import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { ApiResponse, FetchPaymentResponse, FetchPaymentsRequest } from "../../infrastructure/dtos/common.dto";


export class UserFetchAllPaymentsUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
        private paymentRepositoryImpl: PaymentRepositoryImpl,
    ) { }

    async execute(payload: FetchPaymentsRequest): Promise<ApiResponse<FetchPaymentResponse>> {
        try {
            const { userId, page, limit } = payload;
            if (!userId) throw new Error("Invalid request");

            const provider = await this.userRepositoryImpl.findUserById(userId);
            if (!provider) throw new Error("No user found.");

            const result = await this.paymentRepositoryImpl.findAllPayments({ page, limit, userId: userId });
            if (!result) throw new Error("Payments fetching error.");

            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("UserFetchAllPaymentsUseCase error : ", error);
            throw new Error("Failed to fetch all payments");
        }
    }
}
