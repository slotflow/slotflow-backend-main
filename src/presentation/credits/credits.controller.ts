import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../shared/utils/response";
import { getCreditAccountDetailsUseCase, getCreditTransactionsUseCase } from ".";
import { GetCreditTransactionsUseCase } from "../../application/useCases/credits/getCreditTransactions.useCase";
import { GetCreditAccountDetailsUseCase } from "../../application/useCases/credits/getCreditAccountDetails.useCase";
import { DecodedUser } from "../../application/dtos/common.dto";
import { getCreditTransactionsSchema } from "../../shared/zod/credit.zod";

class CreditController {
    constructor(
        private readonly getCreditAccountDetailsUseCase: GetCreditAccountDetailsUseCase,
        private readonly getCreditTransactionsUseCase: GetCreditTransactionsUseCase
    ) {
        this.getCreditAccountDetails = this.getCreditAccountDetails.bind(this);
        this.getCreditTransactions = this.getCreditTransactions.bind(this);
    }

    async getCreditAccountDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const result = await this.getCreditAccountDetailsUseCase.execute({
                userId: user.id
            });
            sendResponse(res, result);
        } catch (error) {
            next(error);
        }
    }

    async getCreditTransactions(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            console.log("req.query : ",req.query);
            const validatedData = getCreditTransactionsSchema.parse(req.query);
            const result = await this.getCreditTransactionsUseCase.execute({
                ...validatedData,
                userId: user.id,
            });

            console.log("result : ",result)
            sendResponse(res, result);
        } catch (error) {
            next(error);
        }
    }
}

export const creditController = new CreditController(
    getCreditAccountDetailsUseCase,
    getCreditTransactionsUseCase
);