import { TableData } from "../../dtos/common.dto";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { GetReferralListInput, GetReferralsListOutput } from "../../dtos/referral.dto";
import { IReferralRepository } from "../../../domain/interfaces/repositories/IReferral.repository";

export class GetReferralsListUseCase {
    constructor(
        private readonly referralRepository: IReferralRepository
    ) { }

    async execute(input: GetReferralListInput): Promise<TableData<Array<GetReferralsListOutput>>> {
        try {
            return await this.referralRepository.findByUserId(
                input.page,
                input.limit,
                input.referrerUserId,
                input.status,
            );
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get referrals list");
        }
    }
}