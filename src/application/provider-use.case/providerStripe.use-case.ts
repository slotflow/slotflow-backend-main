import Stripe from "stripe";
import { stripe } from "../../infrastructure/lib/stripe";
import { Provider } from "../../domain/entities/provider.entity";
import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { Validator } from "../../infrastructure/validator/validator";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";

export class ProviderStripeConnectUseCase {
    constructor(
        private providerRepositoryImpl: ProviderRepositoryImpl,
    ) { }

    async execute(providerId: Provider["_id"]): Promise<ApiResponse<Stripe.Response<Stripe.AccountLink>>> {

        Validator.validateObjectId(providerId, "Provider Id");
        const provider = await this.providerRepositoryImpl.findProviderById(providerId);
        if (!provider) throw new Error("Provider not found");

        let stripeAccountId = provider.stripeAccountId;

        // If provider has no stripe account, create one
        if (!stripeAccountId) {
            const account = await stripe.accounts.create({
                type: "express",
                email: provider.email,
            });
            if (!account) throw new Error("Stripe connecting failed");
            console.log("account : ",account);
            provider.stripeAccountId = account.id;
            const updatedProvider = await this.providerRepositoryImpl.updateProvider(provider);
            if (!updatedProvider) throw new Error("Stripe connecting failed");
        }

        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${process.env.FRONTEND_URL}/provider/stripe/refresh`,
            return_url: `${process.env.FRONTEND_URL}/provider/stripe/success`,
            type: "account_onboarding",
        });

        console.log("accountLink : ",accountLink);

        return { success: true, message: " Stripe connected", data: accountLink };
    }
}