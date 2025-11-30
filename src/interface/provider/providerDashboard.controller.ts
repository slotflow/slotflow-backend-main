import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { SubscriptionPlan } from "../../infrastructure/dtos/common.dto";
import { SubscriptionHelper } from "../../infrastructure/helpers/subscriptionMapping";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ProviderFetchDashboardStatsUseCase } from "../../application/provider-use.case/providerDashboardStats.use-case";
import { ProviderFetchDashboardGraphDataUseCase } from "../../application/provider-use.case/providerDashboardGraphData.use-case";

const subscriptionHelper = new SubscriptionHelper();
const bookingRepositoryImpl = new BookingRepositoryImpl();
const paymentRepositoryImpl = new PaymentRepositoryImpl();

const providerFetchDashboardStatsUseCase = new ProviderFetchDashboardStatsUseCase(bookingRepositoryImpl, paymentRepositoryImpl);
const providerFetchDashboardGraphDataUseCase = new ProviderFetchDashboardGraphDataUseCase(bookingRepositoryImpl, subscriptionHelper);

export class ProviderDashboardController {
    constructor(
        private providerFetchDashboardStatsUseCase: ProviderFetchDashboardStatsUseCase,
        private providerFetchDashboardGraphDataUseCase: ProviderFetchDashboardGraphDataUseCase,
    ) {
        this.getDashboardStats = this.getDashboardStats.bind(this);
        this.getDashboardGraphData = this.getDashboardGraphData.bind(this);
    }

    async getDashboardStats(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.providerFetchDashboardStatsUseCase.execute({providerId: new Types.ObjectId(providerId)});
            res.status(200).json(result);
        } catch (error) {
            console.log("getDashboardStats error : ", error);
            next(error);
        }
    }

    async getDashboardGraphData(req: Request, res: Response, next: NextFunction) {
        try {
            const subscription = req.query.subscription as SubscriptionPlan;
            const startDate = req.query.start ? new Date(req.query.start as string) : undefined;
            const endDate = req.query.end ? new Date(req.query.end as string) : undefined;
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.providerFetchDashboardGraphDataUseCase.execute({
                providerId: new Types.ObjectId(providerId), 
                subscription: subscription ?? "Free",
                endDate: endDate ? new Date(endDate) : undefined,
                startDate: startDate ? new Date(startDate) : undefined,
            });
            res.status(200).json(result);
        } catch (error) {
            console.log("getDashboardGraphData error : ", error);
            next(error);
        }
    }
}

const providerDashboardController = new ProviderDashboardController(
    providerFetchDashboardStatsUseCase,
    providerFetchDashboardGraphDataUseCase
);
export { providerDashboardController };
