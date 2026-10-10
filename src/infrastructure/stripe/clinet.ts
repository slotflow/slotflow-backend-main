import Stripe from "stripe";
import { stripeConfig } from "../../config/env";

export const stripeClient = new Stripe(stripeConfig.stripeSecretKey!);
