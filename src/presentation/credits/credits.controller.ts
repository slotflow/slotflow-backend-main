import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { startAndEndDateSchema } from "../../shared/zod/common.zod";
import { getCreditDetailsUseCase, getCreditTransactionsUseCase } from ".";
import { getCreditTransactionsSchema } from "../../shared/zod/credit.zod";
import { GetCreditDetailsUseCase } from "../../application/useCases/credits/getCreditDetails.useCase";
import { GetCreditTransactionsUseCase } from "../../application/useCases/credits/getCreditTransactions.useCase";

class CreditController {
    constructor(
        private readonly getCreditDetailsUseCase: GetCreditDetailsUseCase,
        private readonly getCreditTransactionsUseCase: GetCreditTransactionsUseCase
    ) {
        this.getCreditAccountDetails = this.getCreditAccountDetails.bind(this);
        this.getCreditTransactions = this.getCreditTransactions.bind(this);
    }

    async getCreditAccountDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const validatedData = startAndEndDateSchema.parse(req.query);
            const result = await this.getCreditDetailsUseCase.execute({
                ...validatedData,
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
            const validatedData = getCreditTransactionsSchema.parse(req.query);
            const result = await this.getCreditTransactionsUseCase.execute({
                ...validatedData,
                userId: user.id,
            });
            sendResponse(res, result);
        } catch (error) {
            next(error);
        }
    }
}

export const creditController = new CreditController(
    getCreditDetailsUseCase,
    getCreditTransactionsUseCase
);