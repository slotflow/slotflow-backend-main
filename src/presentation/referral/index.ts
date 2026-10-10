import { referralQueries } from "../../infrastructure/queries";
import { referralRepository } from "../../infrastructure/repository";
import { GetReferralsListUseCase } from "../../application/useCases/referral/getReferralsList.useCase";
import { GetReferralDetailsUseCase } from "../../application/useCases/referral/getReferralDetails.useCase";

export const getReferralDetailsUseCase = new GetReferralDetailsUseCase(referralQueries);

export const getReferralsListUseCase = new GetReferralsListUseCase(referralRepository);
