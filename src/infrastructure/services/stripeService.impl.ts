import Stripe from "stripe";
import { CreateStripePlanInput, CreateStripePlanOutput, IStripePlanService, UpdateStripePlanInput, UpdateStripePlanOutput } from "../../domain/interfaces/services/IStripePlan.service";

export class StripePlanService implements IStripePlanService {

    constructor(private stripe: Stripe) { }

    async createPlan(params: CreateStripePlanInput): Promise<CreateStripePlanOutput> {

        const marketingFeatures = params.features.map((feature) => ({
            name: feature.replace(/^'|'$/g, "").trim(),
        }));

        const product = await this.stripe.products.create({
            name: `SlotFlow ${params.planName}`,
            description: params.description,
            tax_code: "txcd_10202000",
            marketing_features: marketingFeatures,
            metadata: {
                maxBookingPerMonth: params.maxBookingPerMonth.toString(),
            },
        });

        const monthlyPrice = await this.stripe.prices.create({
            product: product.id,
            currency: "inr",
            unit_amount: Math.round(params.monthlyPrice * 100),
            recurring: {
                interval: "month",
            },
            tax_behavior: 'inclusive'
        });

        const yearlyPrice = await this.stripe.prices.create({
            product: product.id,
            currency: "inr",
            unit_amount: Math.round(params.yearlyPrice * 100),
            recurring: {
                interval: "year",
            },
            tax_behavior: 'inclusive'
        });

        return {
            productId: product.id,
            monthlyPriceId: monthlyPrice.id,
            yearlyPriceId: yearlyPrice.id,
        };
    }

    async updatePlan(params: UpdateStripePlanInput): Promise<UpdateStripePlanOutput> {
        const { productId, planName, description, features, maxBookingPerMonth, monthlyPrice, yearlyPrice } = params;

        const productUpdatePayload: Stripe.ProductUpdateParams = {};

        if (planName) productUpdatePayload.name = `SlotFlow ${planName}`;
        if (description !== undefined) productUpdatePayload.description = description;
        if (features) {
            productUpdatePayload.marketing_features = features.map((f) => ({
                name: f.replace(/^'|'$/g, "").trim(),
            }));
        }
        if (maxBookingPerMonth !== undefined) {
            productUpdatePayload.metadata = {
                maxBookingPerMonth: maxBookingPerMonth.toString(),
            };
        }

        if (Object.keys(productUpdatePayload).length > 0) {
            await this.stripe.products.update(productId, productUpdatePayload);
        }

        let newMonthlyPriceId: string | undefined;
        let newYearlyPriceId: string | undefined;

        if (monthlyPrice) {
            const newPrice = await this.stripe.prices.create({
                product: productId,
                currency: "inr",
                unit_amount: Math.round(monthlyPrice.amount * 100),
                recurring: { interval: "month" },
            });
            newMonthlyPriceId = newPrice.id;

            if (monthlyPrice.oldPriceId) {
                await this.stripe.prices.update(monthlyPrice.oldPriceId, { active: false });
            }
        }

        if (yearlyPrice) {
            const newPrice = await this.stripe.prices.create({
                product: productId,
                currency: "inr",
                unit_amount: Math.round(yearlyPrice.amount * 100),
                recurring: { interval: "year" },
            });
            newYearlyPriceId = newPrice.id;

            if (yearlyPrice.oldPriceId) {
                await this.stripe.prices.update(yearlyPrice.oldPriceId, { active: false });
            }
        }

        return {
            productId,
            monthlyPriceId: newMonthlyPriceId,
            yearlyPriceId: newYearlyPriceId,
        };
    }
}