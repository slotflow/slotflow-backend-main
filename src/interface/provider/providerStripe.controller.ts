import { Types } from "mongoose";
import { Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";
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

    async connectStripe(req: Request, res: Response) {
        try {
            const providerId = req.user.userOrProviderId;
            const result = await this.providerStripeConnectUseCase.execute(new Types.ObjectId(providerId));
            res.status(200).json(result);
        } catch (error) {
            console.log("connectStripe : ", error);
            HandleError.handle(error, res);
        }
    }
}

const providerStripeController = new ProviderStripeController(
    providerStripeConnectUseCase
);
export { providerStripeController }