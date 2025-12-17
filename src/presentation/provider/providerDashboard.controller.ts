import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { SubscriptionPlan } from "../../application/dtos/common.dto";
import { SubscriptionMapping } from "../../infrastructure/helpers/subscriptionMapping";
import { IBookingRepository } from "../../domain/interfaces/repositories/IBooking.repository";
import { IPaymentRepository } from "../../domain/interfaces/repositories/IPayment.repository";
import { ISubscriptionMapping } from "../../domain/interfaces/helper/ISubscriptionMapping.helper";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ProviderFetchDashboardStatsUseCase } from "../../application/useCases/provier/providerDashboardStats.useCase";
import { ProviderFetchDashboardGraphDataUseCase } from "../../application/useCases/provier/providerDashboardGraphData.useCase";

const subscriptionMapping: ISubscriptionMapping = new SubscriptionMapping();

const bookingRepository: IBookingRepository = new BookingRepositoryImpl();
const paymentRepository: IPaymentRepository = new PaymentRepositoryImpl();

const providerFetchDashboardStatsUseCase = new ProviderFetchDashboardStatsUseCase(bookingRepository, paymentRepository);
const providerFetchDashboardGraphDataUseCase = new ProviderFetchDashboardGraphDataUseCase(bookingRepository, subscriptionMapping);

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
