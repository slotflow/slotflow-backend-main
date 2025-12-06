import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { RequestQueryCommonZodSchema } from "../../shared/zod/common.zod";
import { IUserRepository } from "../../domain/interfaces/repositories/IUser.repository";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { IPaymentRepository } from "../../domain/interfaces/repositories/IPayment.repository";
import { UserFetchAllPaymentsUseCase } from "../../application/useCases/user/usePayment.useCase";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";

const userRepository: IUserRepository = new UserRepositoryImpl();
const paymentRepository: IPaymentRepository = new PaymentRepositoryImpl();

const userFetchAllPaymentsUseCase = new UserFetchAllPaymentsUseCase(userRepository, paymentRepository);

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