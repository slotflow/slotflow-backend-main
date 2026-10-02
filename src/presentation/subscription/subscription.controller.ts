import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/helpers/response";
import { AuthUser } from "../../application/dtos/common.dto";
import { validateSubscriptionIdSchema } from "../../shared/zod/base.zod";
import { GetSubscriptionsUseCase } from "../../application/useCases/subscription/getSubscriptions.useCase";
import { providerIdWithPaginationSchema, providerPlanSubscribeSchema } from "../../shared/zod/provider.zod";
import { GetSubscribedPlanUseCase } from "../../application/useCases/subscription/getSubscribedPlan.useCase";
import { SubscriptionCheckoutUseCase } from "../../application/useCases/subscription/subscriptionCheckout.useCase";
import { GetSubscriptionDetailsUseCase } from "../../application/useCases/subscription/getSubscriptionDetails.useCase";
import { getSubscribedPlanUseCase, getSubscriptionDetailsUseCase, getSubscriptionsUseCase, subscriptionCheckoutUseCase } from ".";

class SubscriptionController {
    constructor(
        private readonly getSubscriptionsUseCase: GetSubscriptionsUseCase,
        private readonly getSubscriptionDetailsUseCase: GetSubscriptionDetailsUseCase,
        private readonly subscriptionCheckoutUseCase: SubscriptionCheckoutUseCase,
        private readonly getSubscribedPlanUseCase: GetSubscribedPlanUseCase
    ) {
        this.getSubscriptions = this.getSubscriptions.bind(this);
        this.getSubscriptionDetails = this.getSubscriptionDetails.bind(this);
        this.subscriptionCheckout = this.subscriptionCheckout.bind(this);
        this.getSubscribedPlan = this.getSubscribedPlan.bind(this);
    };

    async getSubscriptions(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as AuthUser;
            const filter: {
                providerId?: string;
            } = {};
            if (user.role === Role.PROVIDER) {
                filter.providerId = user.id;
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
            const { subscriptionId } = validateSubscriptionIdSchema.parse(req.params);
            const result = await this.getSubscriptionDetailsUseCase.execute({ subscriptionId });
            sendResponse(res, result);
        } catch (error) {
            log.error("getSubscriptionDetails failed", error as Error);
            next(error);
        };
    };

    async subscriptionCheckout(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as AuthUser;
            const { planId, billingCycle } = providerPlanSubscribeSchema.parse(req.body);
            const result = await this.subscriptionCheckoutUseCase.execute({
                providerId: user.id,
                planId,
                billingCycle,
                email: user.email,
                name: user.name,
                role: user.role,
                timeZone: user.timeZone
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("subscribe failed", error as Error);
            next(error)
        };
    };

    async getSubscribedPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as AuthUser;
            const result = await this.getSubscribedPlanUseCase.execute({ providerId: user.id });
            sendResponse(res, result);
        } catch (error) {
            log.error("getSubscribedPlan failed", error as Error);
            next(error);
        };
    };
};

export const subscriptionController = new SubscriptionController(
    getSubscriptionsUseCase,
    getSubscriptionDetailsUseCase,
    subscriptionCheckoutUseCase,
    getSubscribedPlanUseCase
);