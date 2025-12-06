import { Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { RequestQueryCommonZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
import { ISubscriptionRepository } from "../../domain/interfaces/repositories/ISubscription.repository";
import { FetchSubscriptionDetailsUseCase } from "../../application/useCases/common/subscription.useCase";
import { AdminFetchAllSubscriptionsUseCase } from "../../application/useCases/admin/adminSubscription.useCase";
import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";

const subscriptionRepository: ISubscriptionRepository = new SubscriptionRepositoryImpl();

const fetchSubscriptionDetailsUseCase = new FetchSubscriptionDetailsUseCase(subscriptionRepository);
const adminFetchAllSubscriptionsUseCase = new AdminFetchAllSubscriptionsUseCase(subscriptionRepository);

export class AdminSubscriptionController {
    constructor(
        private adminFetchAllSubscriptionsUseCase: AdminFetchAllSubscriptionsUseCase,
        private fetchSubscriptionDetailsUseCase: FetchSubscriptionDetailsUseCase,
    ) {
        this.getAllSubscriptions = this.getAllSubscriptions.bind(this);
        this.getSubscriptionDetails = this.getSubscriptionDetails.bind(this);
    }

    async getAllSubscriptions(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminFetchAllSubscriptionsUseCase.execute({ page, limit });
            res.status(200).json(result);
        } catch (error) {
            console.log("getAllSubscriptions error : ", error);
            next(error)
        }
    }

    async getSubscriptionDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: subscriptionId } = ValidateObjectId(req.params.subscriptionId, "Subscription Id");
            if (!subscriptionId) throw new Error("Invalid request.");
            const result = await this.fetchSubscriptionDetailsUseCase.execute({ subscriptionId: new Types.ObjectId(subscriptionId) });
            res.status(200).json(result);
        } catch (error) {
            console.log("getSubscriptionDetails error : ", error);
            next(error)
        }
    }
}

const adminSubscriptionController = new AdminSubscriptionController(
    adminFetchAllSubscriptionsUseCase,
    fetchSubscriptionDetailsUseCase
);
export { adminSubscriptionController }
