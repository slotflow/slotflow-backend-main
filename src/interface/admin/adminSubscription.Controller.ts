import { Types } from "mongoose";
import { Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";
import { RequestQueryCommonZodSchema, ValidateObjectId } from "../../infrastructure/zod/common.zod";
import { AdminFetchAllSubscriptionsUseCase } from "../../application/admin-use.case/adminSubscription.use-case";
import { FetchSubscriptionDetailsUseCase } from "../../application/common-use.case/subscriptionCommon.use-case";
import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";

const subscriptionRepositoryImpl = new SubscriptionRepositoryImpl();

const adminFetchAllSubscriptionsUseCase = new AdminFetchAllSubscriptionsUseCase(subscriptionRepositoryImpl);
const fetchSubscriptionDetailsUseCase = new FetchSubscriptionDetailsUseCase(subscriptionRepositoryImpl);

export class AdminSubscriptionController {
    constructor(
        private adminFetchAllSubscriptionsUseCase: AdminFetchAllSubscriptionsUseCase,
        private fetchSubscriptionDetailsUseCase: FetchSubscriptionDetailsUseCase,
    ) {
        this.getAllSubscriptions = this.getAllSubscriptions.bind(this);
        this.getSubscriptionDetails = this.getSubscriptionDetails.bind(this);
    }

    async getAllSubscriptions(req: Request, res: Response) {
        try {
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminFetchAllSubscriptionsUseCase.execute({ page, limit });
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async getSubscriptionDetails(req: Request, res: Response) {
        try {
            const { id: subscriptionId } = ValidateObjectId(req.params.subscriptionId, "Subscription Id");
            if (!subscriptionId) throw new Error("Invalid request.");
            const result = await this.fetchSubscriptionDetailsUseCase.execute({ subscriptionId: new Types.ObjectId(subscriptionId) });
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }
}

const adminSubscriptionController = new AdminSubscriptionController(
    adminFetchAllSubscriptionsUseCase,
    fetchSubscriptionDetailsUseCase
);
export { adminSubscriptionController }