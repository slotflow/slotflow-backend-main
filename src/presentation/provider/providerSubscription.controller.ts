import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { ProviderPlanSubscribeZodSchema } from "../../shared/zod/provider.zod";
import { FetchSubscriptionDetailsUseCase } from "../../application/useCases/common/subscription.useCase";
import { ProviderFetchAllSubscriptionsUseCase } from "../../application/useCases/provier/providerSubscription.useCase";
import { ProviderTrialSubscriptionUseCase } from "../../application/useCases/provier/providerTrailSubscription.useCase";
import { RequestQueryCommonZodSchema, SaveStripePaymentZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
import { ProviderSaveSubscriptionUseCase, ProviderStripeSubscriptionCreateSessionIdUseCase } from "../../application/useCases/provier/providerStripeSubscription.useCase";
import { fetchSubscriptionDetailsUseCase, providerFetchAllSubscriptionsUseCase, providerSaveSubscriptionUseCase, providerStripeSubscriptionCreateSessionIdUseCase, providerTrialSubscriptionUseCase } from ".";

class ProviderSubscriptionController {
    constructor(
        private providerStripeSubscriptionCreateSessionIdUseCase: ProviderStripeSubscriptionCreateSessionIdUseCase,
        private providerSaveSubscriptionUseCase: ProviderSaveSubscriptionUseCase,
        private providerFetchAllSubscriptionsUseCase: ProviderFetchAllSubscriptionsUseCase,
        private providerTrialSubscriptionUseCase: ProviderTrialSubscriptionUseCase,
        private fetchSubscriptionDetailsUseCase: FetchSubscriptionDetailsUseCase,
    ) {
        this.subscribe = this.subscribe.bind(this);
        this.saveSubscription = this.saveSubscription.bind(this);
        this.fetchProviderSubscriptions = this.fetchProviderSubscriptions.bind(this);
        this.subscribeToTrialPlan = this.subscribeToTrialPlan.bind(this);
        this.getSubscriptionDetails = this.getSubscriptionDetails.bind(this);
    };

    async subscribe(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const { planId, planDuration } = ProviderPlanSubscribeZodSchema.parse(req.body);
            if (!providerId || !planId || !planDuration) throw new Error("Invalid request.");
            const result = await this.providerStripeSubscriptionCreateSessionIdUseCase.execute({ providerId, planId, duration: planDuration });
            sendResponse(res, result);
        } catch (error) {
            log.error("subscribe failed", error as Error);
            next(error)
        };
    };

    async saveSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const { sessionId } = SaveStripePaymentZodSchema.parse(req.body);
            if (!providerId || !sessionId) throw new Error("Invalid request.");
            const result = await this.providerSaveSubscriptionUseCase.execute({ providerId, sessionId });
            sendResponse(res, result, "Your subscription has been activated");
        } catch (error) {
            log.error("saveSubscription failed", error as Error);
            next(error);
        };
    }

    async fetchProviderSubscriptions(req: Request, res: Response, next: NextFunction) {
        try {
            const validateQueryData = RequestQueryCommonZodSchema.parse(req.query);
            const { page, limit } = validateQueryData;
            const providerId = (req.user as DecodedUser).userOrProviderId;
            if (!providerId) throw new Error("Invalid request.");
            const result = await this.providerFetchAllSubscriptionsUseCase.execute({ providerId, page, limit });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchProviderSubscriptions failed", error as Error);
            next(error);
        };
    };

    async subscribeToTrialPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            if (!providerId) throw new Error("Invalid request.");
            const result = await this.providerTrialSubscriptionUseCase.execute({ providerId });
            sendResponse(res, null, "Your trial plan is on live");
        } catch (error) {
            log.error("subscribeToTrialPlan failed", error as Error);
            next(error);
        };
    };

    async getSubscriptionDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: subscriptionId } = ValidateObjectId(req.params.subscriptionId, "Subscription Id");
            if (!subscriptionId) throw new Error("Invalid request.");
            const result = await this.fetchSubscriptionDetailsUseCase.execute({ subscriptionId });
            sendResponse(res, result);
        } catch (error) {
            log.error("getSubscriptionDetails failed", error as Error);
            next(error);
        };
    };

};

export const providerSubscriptionController = new ProviderSubscriptionController(
    providerStripeSubscriptionCreateSessionIdUseCase,
    providerSaveSubscriptionUseCase,
    providerFetchAllSubscriptionsUseCase,
    providerTrialSubscriptionUseCase,
    fetchSubscriptionDetailsUseCase
);