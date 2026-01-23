import { log } from "../../../shared/logger/logger";
import { stripe } from "../../../infrastructure/lib/stripe";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ProviderStripeConnectRequest, ProviderStripeConnectResponse } from "../../dtos/provider.dto";

export class ProviderStripeConnectUseCase {
    constructor(
        private providerRepository: IProviderRepository,
    ) { };

    async execute(payload: ProviderStripeConnectRequest): Promise<ProviderStripeConnectResponse> {
        try {

            const { providerId } = payload
            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("Provider not found");

            let stripeAccountId = provider.stripeAccountId as string;

            // If provider has no stripe account, create one
            if (!stripeAccountId) {
                const account = await stripe.accounts.create({
                    type: "express",
                    email: provider.email,
                });
                if (!account) throw new Error("Stripe connecting failed");
                provider.linkStripeAccount(account.id);
                const updatedProvider = await this.providerRepository.update(provider);
                if (!updatedProvider) throw new Error("Stripe connecting failed");
            };

            const accountLink = await stripe.accountLinks.create({
                account: stripeAccountId,
                refresh_url: `${process.env.FRONTEND_URL}/provider/stripe/refresh`,
                return_url: `${process.env.FRONTEND_URL}/provider/stripe/success`,
                type: "account_onboarding",
            });

            console.log("accountLink : ", accountLink);

            return accountLink;
        } catch (error) {
            log.error("ProviderStripeConnectUseCase failed", error as Error);
            throw error;
        };
    };
};