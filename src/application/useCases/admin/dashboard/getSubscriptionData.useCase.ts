import { toAppError } from "../../../../shared/error/handleUnknownError";
import { ISubscriptionQueries } from "../../../queries/ISubscription.queries";
import { GetSubscriptionDataInput, GetSubscriptionDataOutput } from "../../../dtos/admin.dto";

export class GetSubscriptionDataUseCase {
    constructor(
        private subscriptionQueries: ISubscriptionQueries
    ) { };

    async execute(input: GetSubscriptionDataInput): Promise<GetSubscriptionDataOutput> {
        try {
            return await this.subscriptionQueries.findStatsForAdminDashboard(input);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to fetch subscription data");
        };
    };
};