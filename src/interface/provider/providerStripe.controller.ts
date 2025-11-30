import { Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { ProviderStripeConnectUseCase } from "../../application/provider-use.case/providerStripe.use-case";

const providerRepositoryImpl = new ProviderRepositoryImpl();
const providerStripeConnectUseCase = new ProviderStripeConnectUseCase(providerRepositoryImpl);

export class ProviderStripeController {
    constructor(
        private providerStripeConnectUseCase: ProviderStripeConnectUseCase,
    ) {
        this.connectStripe = this.connectStripe.bind(this);
    }

    async connectStripe(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = req.user.userOrProviderId;
            const result = await this.providerStripeConnectUseCase.execute({providerId: new Types.ObjectId(providerId)});
            res.status(200).json(result);
        } catch (error) {
            console.log("connectStripe : ", error);
            next(error)
        }
    }
}

const providerStripeController = new ProviderStripeController(
    providerStripeConnectUseCase
);
export { providerStripeController }