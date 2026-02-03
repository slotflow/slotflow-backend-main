import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { FetchSubscriptionDetailsUseCase } from "../../application/useCases/common/subscription.useCase";
import { ProviderFetchAllSubscriptionsUseCase } from "../../application/useCases/provider/providerSubscription.useCase";
import { ProviderTrialSubscriptionUseCase } from "../../application/useCases/provider/providerTrailSubscription.useCase";
import { providerIdWithPaginationSchema, providerPlanSubscribeSchema, providerSaveSubscriptionSchema, validateProviderIdSchema } from "../../shared/zod/provider.zod";
import {
    // ProviderSaveSubscriptionUseCase, 
    ProviderSubscriptionCheckoutUseCase
} from "../../application/useCases/provider/providerSubscriptionCheckout.useCase";
import {
    fetchSubscriptionDetailsUseCase, providerFetchAllSubscriptionsUseCase,
    // providerSaveSubscriptionUseCase, 
    providerSubscriptionCheckoutUseCase, providerTrialSubscriptionUseCase
} from ".";
import { validateSubscriptionIdSchema } from "../../shared/zod/base.zod";

class ProviderSubscriptionController {
    constructor(
        private providerSubscriptionCheckoutUseCase: ProviderSubscriptionCheckoutUseCase,
        // private providerSaveSubscriptionUseCase: ProviderSaveSubscriptionUseCase,
        private providerFetchAllSubscriptionsUseCase: ProviderFetchAllSubscriptionsUseCase,
        private providerTrialSubscriptionUseCase: ProviderTrialSubscriptionUseCase,
        private fetchSubscriptionDetailsUseCase: FetchSubscriptionDetailsUseCase,
    ) {
        this.subscribe = this.subscribe.bind(this);
        // this.saveSubscription = this.saveSubscription.bind(this);
        this.fetchProviderSubscriptions = this.fetchProviderSubscriptions.bind(this);
        this.subscribeToTrialPlan = this.subscribeToTrialPlan.bind(this);
        this.getSubscriptionDetails = this.getSubscriptionDetails.bind(this);
    };

    async subscribe(req: Request, res: Response, next: NextFunction) {
        try {
            const { planId, planDuration, providerId } = providerPlanSubscribeSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId,
                ...req.body
            });
            const result = await this.providerSubscriptionCheckoutUseCase.execute({ providerId, planId, duration: planDuration });
            sendResponse(res, result);
        } catch (error) {
            log.error("subscribe failed", error as Error);
            next(error)
        };
    };

    // async saveSubscription(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const { providerId, sessionId } = providerSaveSubscriptionSchema.parse({
    //             providerId: (req.user as DecodedUser).userOrProviderId,
    //             ...req.body
    //         });
    //         const result = await this.providerSaveSubscriptionUseCase.execute({ providerId, sessionId });
    //         sendResponse(res, result, "Your subscription has been activated");
    //     } catch (error) {
    //         log.error("saveSubscription failed", error as Error);
    //         next(error);
    //     };
    // }

    async fetchProviderSubscriptions(req: Request, res: Response, next: NextFunction) {
        try {
            const { limit, page, providerId } = providerIdWithPaginationSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId,
                ...req.query
            });
            const result = await this.providerFetchAllSubscriptionsUseCase.execute({ providerId, page, limit });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchProviderSubscriptions failed", error as Error);
            next(error);
        };
    };

    async subscribeToTrialPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse((req.user as DecodedUser).userOrProviderId);
            await this.providerTrialSubscriptionUseCase.execute({ providerId });
            sendResponse(res, null, "Your trial plan is on live");
        } catch (error) {
            log.error("subscribeToTrialPlan failed", error as Error);
            next(error);
        };
    };

    async getSubscriptionDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { subscriptionId } = validateSubscriptionIdSchema.parse({ subscriptionId: req.params.subscriptionId });
            const result = await this.fetchSubscriptionDetailsUseCase.execute({ subscriptionId });
            sendResponse(res, result);
        } catch (error) {
            log.error("getSubscriptionDetails failed", error as Error);
            next(error);
        };
    };

};

export const providerSubscriptionController = new ProviderSubscriptionController(
    providerSubscriptionCheckoutUseCase,
    // providerSaveSubscriptionUseCase,
    providerFetchAllSubscriptionsUseCase,
    providerTrialSubscriptionUseCase,
    fetchSubscriptionDetailsUseCase
);