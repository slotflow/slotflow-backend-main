import { Provider } from "../../domain/entities/provider.entity";
import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { Validator } from "../../infrastructure/validator/validator";
import { ProviderFetchDashboardStatsDataResponse } from "../../infrastructure/dtos/provider.dto";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";

export class ProviderFetchDashboardStatsUseCase {
    constructor(
        private bookingRepositoryImpl: BookingRepositoryImpl,
        private paymentRepositoryImpl: PaymentRepositoryImpl,
    ) { }

    async execute(providerId: Provider["_id"]): Promise<ApiResponse<ProviderFetchDashboardStatsDataResponse>> {

        try {

            if (!providerId) throw new Error("Invalid request");
            Validator.validateObjectId(providerId, "providerId");
            
            const [
                bookingStatsArray,
                paymentStatsArray
            ] = await Promise.all([
                this.bookingRepositoryImpl.findBookingStatsDataForProviderDashboard(providerId),
                this.paymentRepositoryImpl.findPaymentStatsDataForProviderDashboard(providerId)
            ]);
            
            return { success: true, message: "Dashboard stats fetched successfully", data: {...bookingStatsArray,...paymentStatsArray} }
        } catch (error) {
            console.error("Error in ProviderFetchDashboardStatsUseCase:", error);
            return { success: false, message: "Dashboardstats fetchings failed" };
        }
    }
}