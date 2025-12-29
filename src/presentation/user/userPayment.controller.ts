import { DecodedUser } from "../../express";
import { userFetchAllPaymentsUseCase } from ".";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { RequestQueryCommonZodSchema } from "../../shared/zod/common.zod";
import { UserFetchAllPaymentsUseCase } from "../../application/useCases/user/userPayment.useCase";

class UserPaymentController {
    constructor(
        private userFetchAllPaymentsUseCase: UserFetchAllPaymentsUseCase,
    ) {
        this.fetchPayments = this.fetchPayments.bind(this);
    };

    async fetchPayments(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const validateQueryData = RequestQueryCommonZodSchema.parse(req.query);
            const { page, limit } = validateQueryData;
            if (!userId) throw new Error("Invalid request");
            const result = await this.userFetchAllPaymentsUseCase.execute({ userId, page, limit });
            sendResponse(res,result);
        } catch (error) {
            log.error("fetchPayments failed",error as Error);
            next(error);
        };
    };

};

export const userPaymentController = new UserPaymentController(
    userFetchAllPaymentsUseCase
);