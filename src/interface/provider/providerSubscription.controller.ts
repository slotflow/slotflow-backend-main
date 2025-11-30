import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { ProviderPlanSubscribeZodSchema } from "../../infrastructure/zod/provider.zod";
import { PlanRepositoryImpl } from "../../infrastructure/database/plan/plan.repository.impl";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { FetchSubscriptionDetailsUseCase } from "../../application/common-use.case/subscriptionCommon.use-case";
import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";
import { ProviderFetchAllSubscriptionsUseCase } from "../../application/provider-use.case/providerSubscription.use-case";
import { ProviderTrialSubscriptionUseCase } from "../../application/provider-use.case/providerTrailSubscription.use-case";
import { RequestQueryCommonZodSchema, SaveStripePaymentZodSchema, ValidateObjectId } from "../../infrastructure/zod/common.zod";
import { ProviderSaveSubscriptionUseCase, ProviderStripeSubscriptionCreateSessionIdUseCase } from "../../application/provider-use.case/providerStripeSubscription.use-case";

const planRepositoryImpl = new PlanRepositoryImpl();
const paymentRepositoryImpl = new PaymentRepositoryImpl();
const providerRepositoryImpl = new ProviderRepositoryImpl();
const subscriptionRepositoryImpl = new SubscriptionRepositoryImpl();

const providerStripeSubscriptionCreateSessionIdUseCase = new ProviderStripeSubscriptionCreateSessionIdUseCase(planRepositoryImpl, providerRepositoryImpl, subscriptionRepositoryImpl);
const providerSaveSubscriptionUseCase = new ProviderSaveSubscriptionUseCase(providerRepositoryImpl, paymentRepositoryImpl, subscriptionRepositoryImpl);
const providerFetchAllSubscriptionsUseCase = new ProviderFetchAllSubscriptionsUseCase(providerRepositoryImpl, subscriptionRepositoryImpl);
const providerTrialSubscriptionUseCase = new ProviderTrialSubscriptionUseCase(providerRepositoryImpl, subscriptionRepositoryImpl, planRepositoryImpl);
const fetchSubscriptionDetailsUseCase = new FetchSubscriptionDetailsUseCase(subscriptionRepositoryImpl)

export class ProviderSubscriptionController {
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
    }

    async subscribe(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const { planId, planDuration } = ProviderPlanSubscribeZodSchema.parse(req.body);
            if (!providerId || !planId || !planDuration) throw new Error("Invalid request.");
            const result = await this.providerStripeSubscriptionCreateSessionIdUseCase.execute({ providerId: new Types.ObjectId(providerId), planId: new Types.ObjectId(planId), duration: planDuration });
            res.status(200).json(result);
        } catch (error) {
            console.log("subscribe error : ", error);
            next(error)
        }
    }

    async saveSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const { sessionId } = SaveStripePaymentZodSchema.parse(req.body);
            if (!providerId || !sessionId) throw new Error("Invalid request.");
            const result = await this.providerSaveSubscriptionUseCase.execute({ providerId: new Types.ObjectId(providerId), sessionId });
            res.status(200).json(result);
        } catch (error) {
            console.log("saveSubscription error : ", error);
            next(error)
        }
    }

    async fetchProviderSubscriptions(req: Request, res: Response, next: NextFunction) {
        try {
            const validateQueryData = RequestQueryCommonZodSchema.parse(req.query);
            const { page, limit } = validateQueryData;
            const providerId = (req.user as DecodedUser).userOrProviderId;
            if (!providerId) throw new Error("Invalid request.");
            const result = await this.providerFetchAllSubscriptionsUseCase.execute({ providerId: new Types.ObjectId(providerId), page, limit });
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchProviderSubscriptions error : ", error);
            next(error)
        }
    }

    async subscribeToTrialPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            if (!providerId) throw new Error("Invalid request.");
            const result = await this.providerTrialSubscriptionUseCase.execute({ providerId: new Types.ObjectId(providerId) });
            res.status(200).json(result);
        } catch (error) {
            console.log("subscribeToTrialPlan error : ", error);
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
};

const providerSubscriptionController = new ProviderSubscriptionController(
    providerStripeSubscriptionCreateSessionIdUseCase,
    providerSaveSubscriptionUseCase,
    providerFetchAllSubscriptionsUseCase,
    providerTrialSubscriptionUseCase,
    fetchSubscriptionDetailsUseCase
);

export { providerSubscriptionController };