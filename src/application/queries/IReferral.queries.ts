import { GetReferralDetailsQuery, GetReferralDetailsView } from "../dtos/referral.dto";

export interface IReferralQueries {

    findReferralDetails(query: GetReferralDetailsQuery): Promise<GetReferralDetailsView>;
    
}