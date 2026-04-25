import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { validateSubscriptionIdSchema } from "../../shared/zod/base.zod";
import { GetSubscriptionsUseCase } from "../../application/useCases/subscription/getSubscriptions.useCase";
import { providerIdWithPaginationSchema, providerPlanSubscribeSchema } from "../../shared/zod/provider.zod";
import { TrialSubscriptionUseCase } from "../../application/useCases/subscription/trailSubscription.useCase";
import { GetSubscribedPlanUseCase } from "../../application/useCases/subscription/getSubscribedPlan.useCase";
import { SubscriptionCheckoutUseCase } from "../../application/useCases/subscription/subscriptionCheckout.useCase";
import { GetSubscriptionDetailsUseCase } from "../../application/useCases/subscription/getSubscriptionDetails.useCase";
import { getSubscribedPlanUseCase, getSubscriptionDetailsUseCase, getSubscriptionsUseCase, subscriptionCheckoutUseCase, trialSubscriptionUseCase } from ".";

class SubscriptionController {
    constructor(
        private readonly getSubscriptionsUseCase: GetSubscriptionsUseCase,
        private readonly getSubscriptionDetailsUseCase: GetSubscriptionDetailsUseCase,
        private readonly subscriptionCheckoutUseCase: SubscriptionCheckoutUseCase,
        private readonly trialSubscriptionUseCase: TrialSubscriptionUseCase,
        private readonly getSubscribedPlanUseCase: GetSubscribedPlanUseCase
    ) {
        this.getSubscriptions = this.getSubscriptions.bind(this);
        this.getSubscriptionDetails = this.getSubscriptionDetails.bind(this);
        this.subscriptionCheckout = this.subscriptionCheckout.bind(this);
        this.subscribeToTrialPlan = this.subscribeToTrialPlan.bind(this);
        this.getSubscribedPlan = this.getSubscribedPlan.bind(this);
    };

    async getSubscriptions(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
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
            const { subscriptionId } = validateSubscriptionIdSchema.parse({ subscriptionId: req.params.subscriptionId });
            const result = await this.getSubscriptionDetailsUseCase.execute({ subscriptionId });
            sendResponse(res, result);
        } catch (error) {
            log.error("getSubscriptionDetails failed", error as Error);
            next(error);
        };
    };

    async subscriptionCheckout(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const { planId, planDuration } = providerPlanSubscribeSchema.parse(req.body);
            const result = await this.subscriptionCheckoutUseCase.execute({
                providerId: user.id,
                planId,
                planDuration
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("subscribe failed", error as Error);
            next(error)
        };
    };

    async subscribeToTrialPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            await this.trialSubscriptionUseCase.execute({ providerId: user.id });
            sendResponse(res, null, "Your trial plan is on live");
        } catch (error) {
            log.error("subscribeToTrialPlan failed", error as Error);
            next(error);
        };
    };

    async getSubscribedPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
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
    trialSubscriptionUseCase,
    getSubscribedPlanUseCase
);