import { log } from "../../shared/logger/logger";
import { providerStripeConnectUseCase } from ".";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { validateProviderIdSchema } from "../../shared/zod/provider.zod";
import { ProviderStripeConnectUseCase } from "../../application/useCases/provider/providerStripe.useCase";

class ProviderStripeController {
    constructor(
        private providerStripeConnectUseCase: ProviderStripeConnectUseCase,
    ) {
        this.connectStripe = this.connectStripe.bind(this);
    };

    async connectStripe(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse({ providerId: (req.user as DecodedUser).userOrProviderId });
            const result = await this.providerStripeConnectUseCase.execute({ providerId });
            sendResponse(res, result, "Stripe connected");
        } catch (error) {
            log.error("connectStripe failed", error as Error);
            next(error);
        };
    };

};

export const providerStripeController = new ProviderStripeController(
    providerStripeConnectUseCase
);
