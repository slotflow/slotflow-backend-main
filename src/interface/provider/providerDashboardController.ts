import { Types } from "mongoose";
import { Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ProviderFetchDashboardStatsUseCase } from "../../application/provider-use.case/providerDashboardStats.use-case";

const bookingRepositoryImpl = new BookingRepositoryImpl();
const paymentRepositoryImpl = new PaymentRepositoryImpl();
const providerFetchDashboardStatsUseCase = new ProviderFetchDashboardStatsUseCase( bookingRepositoryImpl, paymentRepositoryImpl );

export class ProviderDashboardController {
    constructor(
        private providerFetchDashboardStatsUseCase: ProviderFetchDashboardStatsUseCase,
    ) {
        this.getDashboardStats = this.getDashboardStats.bind(this);
    }

    async getDashboardStats(req:Request, res: Response) {
        try{
            const providerId = req.user.userOrProviderId;
            const result = await this.providerFetchDashboardStatsUseCase.execute(new Types.ObjectId(providerId));
            console.log("provider get dashboard stats result : ",result.data);
            res.status(200).json(result);
        } catch(error) {
            console.log("provider get dashboard stats error : ",error);
            HandleError.handle(error, res)
        }
    }
}

const providerDashboardController = new ProviderDashboardController( providerFetchDashboardStatsUseCase );
export { providerDashboardController };