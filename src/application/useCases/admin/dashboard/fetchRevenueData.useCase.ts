import { log } from "../../../../shared/logger/logger";
import { FetchRevenueDataResponse } from "../../../dtos/admin.dto";
import { IPaymentQueries } from "../../../queries/IPayment.queries";

export class FetchRevenueDataUseCase {
    constructor(
        private paymentQueries: IPaymentQueries
    ) { };

    async execute(): Promise<FetchRevenueDataResponse> {
        try {
            return await this.paymentQueries.findStatsDataForAdminDashboard();
        } catch (error) {
            log.error("FetchRevenueDataUseCase failed", error as Error);
            throw error;
        };
    };
};