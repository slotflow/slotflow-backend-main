import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { startAndEndDateSchema } from "../../shared/zod/common.zod";
import { getReferralDetailsUseCase, getReferralsListUseCase } from ".";
import { getReferralsListSchema } from "../../shared/zod/referral.zod";
import { GetReferralsListUseCase } from "../../application/useCases/referral/getReferralsList.useCase";
import { GetReferralDetailsUseCase } from "../../application/useCases/referral/getReferralDetails.useCase";

class ReferralController {
    constructor(
        private readonly getReferralDetailsUseCase: GetReferralDetailsUseCase,
        private readonly getReferralsListUseCase: GetReferralsListUseCase
    ) {
        this.getReferralDetails = this.getReferralDetails.bind(this);
        this.getReferralsList = this.getReferralsList.bind(this);
    }

    async getReferralDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const validatedData = startAndEndDateSchema.parse(req.query);
            const result = await this.getReferralDetailsUseCase.execute({
                ...validatedData,
                userId: user.id,
            });
            sendResponse(res, result);
        } catch (error) {
            next(error);
        }
    }

    async getReferralsList(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const validatedData = getReferralsListSchema.parse(req.query);
            const result = await this.getReferralsListUseCase.execute({
                ...validatedData,
                referrerUserId: user.id
            });
            sendResponse(res, result);
        } catch (error) {
            next(error);
        }
    }
}

export const referralController = new ReferralController(
    getReferralDetailsUseCase,
    getReferralsListUseCase
);