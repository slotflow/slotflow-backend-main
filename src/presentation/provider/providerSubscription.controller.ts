import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { ProviderPlanSubscribeZodSchema } from "../../shared/zod/provider.zod";
import { IPlanRepository } from "../../domain/interfaces/repositories/IPlan.repository";
import { PlanRepositoryImpl } from "../../infrastructure/database/plan/plan.repository.impl";
import { IPaymentRepository } from "../../domain/interfaces/repositories/IPayment.repository";
import { IProviderRepository } from "../../domain/interfaces/repositories/IProvider.repository";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { ISubscriptionRepository } from "../../domain/interfaces/repositories/ISubscription.repository";
import { FetchSubscriptionDetailsUseCase } from "../../application/useCases/common/subscription.useCase";
import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";
import { ProviderFetchAllSubscriptionsUseCase } from "../../application/useCases/provier/providerSubscription.useCase";
import { ProviderTrialSubscriptionUseCase } from "../../application/useCases/provier/providerTrailSubscription.useCase";
import { RequestQueryCommonZodSchema, SaveStripePaymentZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
import { ProviderSaveSubscriptionUseCase, ProviderStripeSubscriptionCreateSessionIdUseCase } from "../../application/useCases/provier/providerStripeSubscription.useCase";

const planRepository: IPlanRepository = new PlanRepositoryImpl();
const paymentRepository: IPaymentRepository = new PaymentRepositoryImpl();
const providerRepository: IProviderRepository = new ProviderRepositoryImpl();
const subscriptionRepository: ISubscriptionRepository = new SubscriptionRepositoryImpl();

const fetchSubscriptionDetailsUseCase = new FetchSubscriptionDetailsUseCase(subscriptionRepository);
const providerFetchAllSubscriptionsUseCase = new ProviderFetchAllSubscriptionsUseCase(providerRepository, subscriptionRepository);
const providerTrialSubscriptionUseCase = new ProviderTrialSubscriptionUseCase(providerRepository, subscriptionRepository, planRepository);
const providerSaveSubscriptionUseCase = new ProviderSaveSubscriptionUseCase(providerRepository, paymentRepository, subscriptionRepository);
const providerStripeSubscriptionCreateSessionIdUseCase = new ProviderStripeSubscriptionCreateSessionIdUseCase(planRepository, providerRepository, subscriptionRepository);

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