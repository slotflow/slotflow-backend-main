import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { ApiResponse, FetchPaymentResponse, FetchPaymentsRequest } from "../../dtos/common.dto";

export class UserFetchAllPaymentsUseCase {
    constructor(
        private userRepository: IUserRepository,
        private paymentRepository: IPaymentRepository,
    ) { }

    async execute(payload: FetchPaymentsRequest): Promise<ApiResponse<FetchPaymentResponse>> {
        try {
            const { userId, page, limit } = payload;
            if (!userId) throw new Error("Invalid request");

            const provider = await this.userRepository.findUserById(userId);
            if (!provider) throw new Error("No user found.");

            const result = await this.paymentRepository.findAllPayments({ page, limit, userId: userId });
            if (!result) throw new Error("Payments fetching error.");

            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("UserFetchAllPaymentsUseCase error : ", error);
            throw new Error("Failed to fetch all payments");
        }
    }
}
