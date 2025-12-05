import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { RequestQueryCommonZodSchema } from "../../shared/zod/common.zod";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { UserFetchAllPaymentsUseCase } from "../../application/user-use.case/usePayment.use-case";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";

const userRepositoryImpl = new UserRepositoryImpl();
const paymentRepositoryImpl = new PaymentRepositoryImpl();

const userFetchAllPaymentsUseCase = new UserFetchAllPaymentsUseCase(userRepositoryImpl, paymentRepositoryImpl);

export class UserPaymentController {
    constructor(
        private userFetchAllPaymentsUseCase: UserFetchAllPaymentsUseCase,
    ) {
        this.fetchPayments = this.fetchPayments.bind(this);
    }

    async fetchPayments(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const validateQueryData = RequestQueryCommonZodSchema.parse(req.query);
            const { page, limit } = validateQueryData;
            if (!userId) throw new Error("Invalid request");
            const result = await this.userFetchAllPaymentsUseCase.execute({ userId: new Types.ObjectId(userId), page, limit });
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchPayments error : ",error);
            next(error)
        }
    }

}

const userPaymentController = new UserPaymentController(
    userFetchAllPaymentsUseCase
);
export { userPaymentController };