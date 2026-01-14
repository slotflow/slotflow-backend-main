import { userFetchAllPaymentsUseCase } from ".";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { userIdWithPaginationSchema } from "../../shared/zod/user.zod";
import { UserFetchAllPaymentsUseCase } from "../../application/useCases/user/userPayment.useCase";

class UserPaymentController {
    constructor(
        private userFetchAllPaymentsUseCase: UserFetchAllPaymentsUseCase,
    ) {
        this.fetchPayments = this.fetchPayments.bind(this);
    };

    async fetchPayments(req: Request, res: Response, next: NextFunction) {
        try {
            const { limit, page, userId } = userIdWithPaginationSchema.parse({
                userId: (req.user as DecodedUser).userOrProviderId,
                ...req.query
            });
            const result = await this.userFetchAllPaymentsUseCase.execute({ userId, page, limit });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchPayments failed", error as Error);
            next(error);
        };
    };

};

export const userPaymentController = new UserPaymentController(
    userFetchAllPaymentsUseCase
);