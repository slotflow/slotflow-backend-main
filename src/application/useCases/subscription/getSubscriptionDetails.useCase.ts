import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";
import { GetSubscriptionDetailsInput, GetSubscriptionDetailsOutput } from "../../dtos/subscription.dto";

export class GetSubscriptionDetailsUseCase {
    constructor(
        private subscirptionQueries: ISubscriptionQueries
    ) { };

    async execute(input: GetSubscriptionDetailsInput): Promise<GetSubscriptionDetailsOutput | null> {
        try {
            const { subscriptionId } = input;
            if (!subscriptionId) {
                throw new BadRequestError();
            }

            const subscriptionDetails = await this.subscirptionQueries.findDetails({ subscriptionId });
            if (!subscriptionDetails) return null;

            return subscriptionDetails;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get subscription details");
        };
    };
};