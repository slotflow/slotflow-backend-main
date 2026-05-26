import { IReferralQueries } from "../../queries/IReferral.queries";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { GetReferralDetailsInput, GetReferralDetailsOutput } from "../../dtos/referral.dto";

export class GetReferralDetailsUseCase {
    constructor(
        private readonly referralQueries: IReferralQueries
    ) { }

    async execute(input: GetReferralDetailsInput) : Promise<GetReferralDetailsOutput> {
        try {
            return await this.referralQueries.findReferralDetails(input);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get referral details");
        }
    }
}