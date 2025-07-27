import { Types } from "mongoose";
import { Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ProviderFetchDashboardStatsUseCase } from "../../application/provider-use.case/providerDashboardStats.use-case";
import { ProviderFetchDashboardGraphDataUseCase } from "../../application/provider-use.case/providerDashboardGraphData.use-case";

const bookingRepositoryImpl = new BookingRepositoryImpl();
const paymentRepositoryImpl = new PaymentRepositoryImpl();
const providerFetchDashboardStatsUseCase = new ProviderFetchDashboardStatsUseCase( bookingRepositoryImpl, paymentRepositoryImpl );
const providerFetchDashboardGraphDataUseCase = new ProviderFetchDashboardGraphDataUseCase(bookingRepositoryImpl);

export class ProviderDashboardController {
    constructor(
        private providerFetchDashboardStatsUseCase: ProviderFetchDashboardStatsUseCase,
        private providerFetchDashboardGraphDataUseCase: ProviderFetchDashboardGraphDataUseCase,
    ) {
        this.getDashboardStats = this.getDashboardStats.bind(this);
        this.getDashboardGraphData = this.getDashboardGraphData.bind(this);
    }

    async getDashboardStats(req:Request, res: Response) {
        try{
            const providerId = req.user.userOrProviderId;
            const result = await this.providerFetchDashboardStatsUseCase.execute(new Types.ObjectId(providerId));
            res.status(200).json(result);
        } catch(error) {
            console.log("provider get dashboard stats error : ",error);
            HandleError.handle(error, res)
        }
    }

    async getDashboardGraphData(req:Request, res: Response) {
        try{
            const providerId = req.user.userOrProviderId;
            const result = await this.providerFetchDashboardGraphDataUseCase.execute(new Types.ObjectId(providerId));
            res.status(200).json(result);
        } catch(error) {
            console.log("provider get dashboard graph data error : ",error);
            HandleError.handle(error, res)
        }
    }
}

const providerDashboardController = new ProviderDashboardController( providerFetchDashboardStatsUseCase, providerFetchDashboardGraphDataUseCase );
export { providerDashboardController };