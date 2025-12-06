import { ApiResponse } from "../../../infrastructure/dtos/common.dto";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { ProviderFetchDashboardStatsDataRequest, ProviderFetchDashboardStatsDataResponse } from "../../../infrastructure/dtos/provider.dto";

export class ProviderFetchDashboardStatsUseCase {
    constructor(
        private bookingRepository: IBookingRepository,
        private paymentRepository: IPaymentRepository,
    ) { }

    async execute(payload: ProviderFetchDashboardStatsDataRequest): Promise<ApiResponse<ProviderFetchDashboardStatsDataResponse>> {
        try {
            const { providerId } = payload;

            const [
                bookingStatsArray,
                paymentStatsArray
            ] = await Promise.all([
                this.bookingRepository.findBookingStatsDataForProviderDashboard(providerId),
                this.paymentRepository.findPaymentStatsDataForProviderDashboard(providerId)
            ]);

            return { success: true, message: "Dashboard stats fetched successfully", data: { ...bookingStatsArray, ...paymentStatsArray } }
        } catch (error) {
            console.error("ProviderFetchDashboardStatsUseCase error :", error);
            throw new Error("Failed to fetch dashboard stats");
        }
    }
}