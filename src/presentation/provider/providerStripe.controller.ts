import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { IProviderRepository } from "../../domain/interfaces/repositories/IProvider.repository";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { ProviderStripeConnectUseCase } from "../../application/useCases/provier/providerStripe.useCase";

const providerRepository: IProviderRepository = new ProviderRepositoryImpl();
const providerStripeConnectUseCase = new ProviderStripeConnectUseCase(providerRepository);

class ProviderStripeController {
    constructor(
        private providerStripeConnectUseCase: ProviderStripeConnectUseCase,
    ) {
        this.connectStripe = this.connectStripe.bind(this);
    };

    async connectStripe(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = req.user.userOrProviderId;
            const result = await this.providerStripeConnectUseCase.execute({ providerId });
            sendResponse(res,result,"Stripe connected");
        } catch (error) {
            log.error("connectStripe failed", error as Error);
            next(error);
        };
    };

};

export const providerStripeController = new ProviderStripeController(
    providerStripeConnectUseCase
);
