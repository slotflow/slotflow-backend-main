import Stripe from "stripe";
import { stripeConfig } from "../../config/env";

export const stripe = new Stripe(stripeConfig.stripeSecretKey!);