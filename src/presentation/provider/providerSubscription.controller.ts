import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { providerPlanSubscribeSchema, validateProviderIdSchema } from "../../shared/zod/provider.zod";
import { ProviderTrialSubscriptionUseCase } from "../../application/useCases/provider/providerTrailSubscription.useCase";
import { ProviderFetchSubscribedPlanUseCase } from "../../application/useCases/provider/providerFetchSubscribedPlan.useCase";
import { ProviderSubscriptionCheckoutUseCase } from "../../application/useCases/provider/providerSubscriptionCheckout.useCase";
import { providerFetchSubscribedPlanUseCase, providerSubscriptionCheckoutUseCase, providerTrialSubscriptionUseCase } from ".";

class ProviderSubscriptionController {
    constructor(
        private providerSubscriptionCheckoutUseCase: ProviderSubscriptionCheckoutUseCase,
        private providerTrialSubscriptionUseCase: ProviderTrialSubscriptionUseCase,
        private providerFetchSubscribedPlanUseCase: ProviderFetchSubscribedPlanUseCase
    ) {
        this.subscriptionCheckout = this.subscriptionCheckout.bind(this);
        this.subscribeToTrialPlan = this.subscribeToTrialPlan.bind(this);
        this.getSubscribedPlan = this.getSubscribedPlan.bind(this);
    };

    async subscriptionCheckout(req: Request, res: Response, next: NextFunction) {
        try {
            const { planId, planDuration, providerId } = providerPlanSubscribeSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId,
                ...req.body
            });
            const result = await this.providerSubscriptionCheckoutUseCase.execute({ providerId, planId, planDuration });
            console.log("result : ", result);
            sendResponse(res, result);
        } catch (error) {
            log.error("subscribe failed", error as Error);
            next(error)
        };
    };

    async subscribeToTrialPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId
            });
            await this.providerTrialSubscriptionUseCase.execute({ providerId });
            sendResponse(res, null, "Your trial plan is on live");
        } catch (error) {
            log.error("subscribeToTrialPlan failed", error as Error);
            next(error);
        };
    };

    async getSubscribedPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId
            });
            const result = await this.providerFetchSubscribedPlanUseCase.execute({ providerId });
            sendResponse(res, result);
        } catch (error) {
            log.error("getSubscribedPlan failed", error as Error);
            next(error);
        };
    };

};

export const providerSubscriptionController = new ProviderSubscriptionController(
    providerSubscriptionCheckoutUseCase,
    providerTrialSubscriptionUseCase,
    providerFetchSubscribedPlanUseCase
);