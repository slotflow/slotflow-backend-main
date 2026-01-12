// Queries instance

import { UserQueriesImpl } from "./userQueries.impl";
import { ReviewQueriesImpl } from "./reviewQueries.impl";
import { BookingQueriesImpl } from "./bookingQueries.impl";
import { PaymentQueriesImpl } from "./paymentQueries.impl";
import { ProviderQueriesImpl } from "./providerQueries.impl";
import { SubscriptionQueriesImpl } from "./subscriptionQueries.impl";
import { IUserQueries } from "../../application/queries/IUser.queries";
import { IReviewQueries } from "../../application/queries/IReview.queries";
import { ProviderServiceQueriesImpl } from "./providerServiceQueries.impl";
import { IBookingQueries } from "../../application/queries/IBooking.queries";
import { IPaymentQueries } from "../../application/queries/IPayment.queries";
import { IProviderQueries } from "../../application/queries/IProvider.queries";
import { ServiceAvailabilityQueriesImpl } from "./serviceAvailabilityQueries.impl";
import { ISubscriptionQueries } from "../../application/queries/ISubscription.queries";
import { IProviderServiceQueries } from "../../application/queries/IProviderService.queries";
import { IServiceAvailabilityQueries } from "../../application/queries/IServiceAvailability.queries";

// booking queries instance
export const bookingQueries: IBookingQueries = new BookingQueriesImpl();

// payment queries instance
export const paymentQueries: IPaymentQueries = new PaymentQueriesImpl();

// provider queries instance
export const providerQueries: IProviderQueries = new ProviderQueriesImpl();

// provider service querues instance
export const providerServiceQueries: IProviderServiceQueries = new ProviderServiceQueriesImpl();

// review queries instance
export const reviewQueries: IReviewQueries = new ReviewQueriesImpl();

// service availability queries instance
export const serviceAvailabilityQueries: IServiceAvailabilityQueries = new ServiceAvailabilityQueriesImpl();

// subscription queries instance
export const subscriptionQueries: ISubscriptionQueries = new SubscriptionQueriesImpl();

// user queries instance
export const userQueries: IUserQueries = new UserQueriesImpl();