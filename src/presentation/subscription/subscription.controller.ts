import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { validateSubscriptionIdSchema } from "../../shared/zod/base.zod";
import { getSubscriptionDetailsUseCase, getSubscriptionsUseCase } from ".";
import { providerIdWithPaginationSchema } from "../../shared/zod/provider.zod";
import { GetSubscriptionsUseCase } from "../../application/useCases/subscription/getSubscriptions.useCase";
import { GetSubscriptionDetailsUseCase } from "../../application/useCases/subscription/getSubscriptionDetails.useCase";

class SubscriptionController {
    constructor(
        private readonly getSubscriptionsUseCase: GetSubscriptionsUseCase,
        private readonly getSubscriptionDetailsUseCase: GetSubscriptionDetailsUseCase,
    ) {
        this.getSubscriptions = this.getSubscriptions.bind(this);
        this.getSubscriptionDetails = this.getSubscriptionDetails.bind(this);
    };

    async getSubscriptions(req: Request, res: Response, next: NextFunction) {
        try {
            const filter: {
                providerId?: string;
            } = {};
            const user = req.user as DecodedUser;

            if (user.role === Role.PROVIDER) {
                filter.providerId = user.userOrProviderId;
            };

            if (user.role === Role.ADMIN) {
                filter.providerId = req.query.providerId as string
            }

            const { limit, page, providerId } = providerIdWithPaginationSchema.parse({
                ...filter,
                ...req.query
            });
            const result = await this.getSubscriptionsUseCase.execute({ providerId, page, limit });
            sendResponse(res, result);
        } catch (error) {
            log.error("getSubscriptions failed", error as Error);
            next(error);
        };
    };

    async getSubscriptionDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { subscriptionId } = validateSubscriptionIdSchema.parse({ subscriptionId: req.params.subscriptionId });
            const result = await this.getSubscriptionDetailsUseCase.execute({ subscriptionId });
            console.log("result : ", result);
            sendResponse(res, result);
        } catch (error) {
            log.error("getSubscriptionDetails failed", error as Error);
            next(error);
        };
    };

};

export const subscriptionController = new SubscriptionController(
    getSubscriptionsUseCase,
    getSubscriptionDetailsUseCase,
);