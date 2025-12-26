import { DecodedUser } from "../../express";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { SubscriptionPlan } from "../../application/dtos/common.dto";
import { IBookingQueries } from "../../application/queries/IBooking.queries";
import { IPaymentQueries } from "../../application/queries/IPayment.queries";
import { BookingQueriesImpl } from "../../infrastructure/queries/bookingQueries.impl";
import { PaymentQueriesImpl } from "../../infrastructure/queries/paymentQueries.impl";
import { SubscriptionMapping } from "../../infrastructure/helpers/subscriptionMapping";
import { ISubscriptionMapping } from "../../domain/interfaces/helper/ISubscriptionMapping.helper";
import { ProviderFetchDashboardStatsUseCase } from "../../application/useCases/provier/providerDashboardStats.useCase";
import { ProviderFetchDashboardGraphDataUseCase } from "../../application/useCases/provier/providerDashboardGraphData.useCase";

const subscriptionMapping: ISubscriptionMapping = new SubscriptionMapping();

const bookingQueries: IBookingQueries = new BookingQueriesImpl();
const paymentQueries: IPaymentQueries = new PaymentQueriesImpl();

const providerFetchDashboardStatsUseCase = new ProviderFetchDashboardStatsUseCase(bookingQueries, paymentQueries);
const providerFetchDashboardGraphDataUseCase = new ProviderFetchDashboardGraphDataUseCase(bookingQueries, subscriptionMapping);

class ProviderDashboardController {
    constructor(
        private providerFetchDashboardStatsUseCase: ProviderFetchDashboardStatsUseCase,
        private providerFetchDashboardGraphDataUseCase: ProviderFetchDashboardGraphDataUseCase,
    ) {
        this.getDashboardStats = this.getDashboardStats.bind(this);
        this.getDashboardGraphData = this.getDashboardGraphData.bind(this);
    };

    async getDashboardStats(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.providerFetchDashboardStatsUseCase.execute({ providerId });
            sendResponse(res, result);
        } catch (error) {
            log.error("getDashboardStats failed", error as Error);
            next(error);
        };
    };

    async getDashboardGraphData(req: Request, res: Response, next: NextFunction) {
        try {
            const subscription = req.query.subscription as SubscriptionPlan;
            const startDate = req.query.start ? new Date(req.query.start as string) : undefined;
            const endDate = req.query.end ? new Date(req.query.end as string) : undefined;
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.providerFetchDashboardGraphDataUseCase.execute({
                providerId, 
                subscription: subscription ?? "Free",
                endDate: endDate ? new Date(endDate) : undefined,
                startDate: startDate ? new Date(startDate) : undefined,
            });
            sendResponse(res,result);
        } catch (error) {
            log.error("getDashboardGraphData failed", error as Error);
            next(error);
        };
    };

};

export const providerDashboardController = new ProviderDashboardController(
    providerFetchDashboardStatsUseCase,
    providerFetchDashboardGraphDataUseCase
);