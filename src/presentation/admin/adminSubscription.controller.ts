import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { adminFetchAllSubscriptionsUseCase, fetchSubscriptionDetailsUseCase } from ".";
import { paginationSchema } from "../../shared/zod/common.zod";
import { FetchSubscriptionDetailsUseCase } from "../../application/useCases/common/subscription.useCase";
import { AdminFetchAllSubscriptionsUseCase } from "../../application/useCases/admin/adminSubscription.useCase";
import { adminGetSubscriptionDetailsSchema } from "../../shared/zod/admin.zod";

class AdminSubscriptionController {
    constructor(
        private adminFetchAllSubscriptionsUseCase: AdminFetchAllSubscriptionsUseCase,
        private fetchSubscriptionDetailsUseCase: FetchSubscriptionDetailsUseCase,
    ) {
        this.getAllSubscriptions = this.getAllSubscriptions.bind(this);
        this.getSubscriptionDetails = this.getSubscriptionDetails.bind(this);
    };

    async getAllSubscriptions(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = paginationSchema.parse(req.query);
            const result = await this.adminFetchAllSubscriptionsUseCase.execute({ page, limit });
            sendResponse(res, result);
        } catch (error) {
            log.error("getAllSubscriptions failed", error as Error);
            next(error);
        };
    };

    async getSubscriptionDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { subscriptionId } = adminGetSubscriptionDetailsSchema.parse({ subscriptionId: req.params.subscriptionId });
            if (!subscriptionId) throw new Error("Invalid request.");
            const result = await this.fetchSubscriptionDetailsUseCase.execute({ subscriptionId });
            sendResponse(res, result);
        } catch (error) {
            log.error("getSubscriptionDetails failed", error as Error);
            next(error);
        };
    };

}

export const adminSubscriptionController = new AdminSubscriptionController(
    adminFetchAllSubscriptionsUseCase,
    fetchSubscriptionDetailsUseCase
);
