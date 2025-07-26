import { Provider } from "../../domain/entities/provider.entity";
import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { Validator } from "../../infrastructure/validator/validator";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { BookingStatsData, PaymentStatsData, ProviderFetchDashboardStatsDataResponse } from "../../infrastructure/dtos/provider.dto";

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
                this.bookingRepositoryImpl.findBookingStatsDataForDashboard(providerId),
                this.paymentRepositoryImpl.findPaymentStatsDataForDashboard(providerId)
            ])
            
            
            const bookingStats: BookingStatsData = {
                totalAppointments: bookingStatsArray.totalAppointments[0]?.count || 0,
                completedAppointments: bookingStatsArray.completedAppointments[0]?.count || 0,
                missedAppointments: bookingStatsArray.missedAppointments[0]?.count || 0,
                cancelledAppointmentsByUser: bookingStatsArray.cancelledAppointmentsByUser[0]?.count || 0,
                rejectedAppointmentsByProvider: bookingStatsArray.rejectedAppointmentsByProvider[0]?.count || 0,
                todaysAppointments: bookingStatsArray.todaysAppointments[0]?.count || 0,
            };
            
            const paymentStats: PaymentStatsData = {
                totalSubscriptionPaidAmount: paymentStatsArray.totalSubscriptionPaidAmount[0]?.amount || 0,
                totalEarnings: paymentStatsArray.totalEarnings[0]?.amount || 0,
                todaysEarnings: paymentStatsArray.todaysEarnings[0]?.amount || 0,
                totalPayoutsMade: paymentStatsArray.totalPayoutsMade[0]?.amount || 0,
                pendingPayout: paymentStatsArray.pendingPayout[0]?.amount || 0,
            }
            
            
            return {
                success: true, message: "Dashboard stats fetched successfully", data: {
                    totalAppointments: bookingStats.totalAppointments,
                    completedAppointments: bookingStats.completedAppointments,
                    missedAppointments: bookingStats.missedAppointments,
                    cancelledAppointmentsByUser: bookingStats.cancelledAppointmentsByUser,
                    rejectedAppointmentsByProvider: bookingStats.rejectedAppointmentsByProvider,
                    todaysAppointments: bookingStats.todaysAppointments,
    
                    totalSubscriptionPaidAmount: paymentStats.totalSubscriptionPaidAmount,
                    totalEarnings: paymentStats.totalEarnings,
                    todaysEarnings: paymentStats.todaysEarnings,
                    totalPayoutsMade: paymentStats.totalPayoutsMade,
                    pendingPayout: paymentStats.pendingPayout,
                }
            }
        } catch (error) {
            console.error("Error in ProviderFetchDashboardStatsUseCase:", error);
            return { success: false, message: "Dashboardstats fetchings failed" };
        }
    }
}