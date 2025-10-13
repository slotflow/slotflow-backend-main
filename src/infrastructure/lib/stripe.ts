import Stripe from "stripe";
import { stripeCOnfig } from "../../config/env";

export const stripe = new Stripe(stripeCOnfig.stripeSecretKey!);