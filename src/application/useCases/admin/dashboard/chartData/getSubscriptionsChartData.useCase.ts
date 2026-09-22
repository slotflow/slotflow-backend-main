import { toAppError } from "../../../../../shared/error/handleUnknownError";
import { ISubscriptionQueries } from "../../../../interfaces/queries/ISubscription.queries";
import { GetSubscriptionsChartDataInput, GetSubscriptionsChartDataOutput } from "../../../../dtos/subscription.dto";

export class GetSubscriptionsChartDataUseCase {
    constructor(
        private readonly subscriptionQueries: ISubscriptionQueries
    ) { }

    async execute(input: GetSubscriptionsChartDataInput): Promise<GetSubscriptionsChartDataOutput> {
        try {
            return await this.subscriptionQueries.findAnalyticsForAdminDashboard(input);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to fetch subscriptions chart data");
        }
    }
}