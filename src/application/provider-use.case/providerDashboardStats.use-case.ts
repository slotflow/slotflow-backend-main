import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { ProviderFetchDashboardStatsDataRequest, ProviderFetchDashboardStatsDataResponse } from "../../infrastructure/dtos/provider.dto";

export class ProviderFetchDashboardStatsUseCase {
    constructor(
        private bookingRepositoryImpl: BookingRepositoryImpl,
        private paymentRepositoryImpl: PaymentRepositoryImpl,
    ) { }

    async execute(payload: ProviderFetchDashboardStatsDataRequest): Promise<ApiResponse<ProviderFetchDashboardStatsDataResponse>> {
        try {
            const { providerId } = payload;

            const [
                bookingStatsArray,
                paymentStatsArray
            ] = await Promise.all([
                this.bookingRepositoryImpl.findBookingStatsDataForProviderDashboard(providerId),
                this.paymentRepositoryImpl.findPaymentStatsDataForProviderDashboard(providerId)
            ]);

            return { success: true, message: "Dashboard stats fetched successfully", data: { ...bookingStatsArray, ...paymentStatsArray } }
        } catch (error) {
            console.error("ProviderFetchDashboardStatsUseCase error :", error);
            throw new Error("Failed to fetch dashboard stats");
        }
    }
}