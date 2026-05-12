// Queries instance

import { UserQueriesImpl } from "./userQueries.impl";
import { ReviewQueriesImpl } from "./reviewQueries.impl";
import { BookingQueriesImpl } from "./bookingQueries.impl";
import { SubscriptionQueriesImpl } from "./subscriptionQueries.impl";
import { IUserQueries } from "../../application/queries/IUser.queries";
import { IReviewQueries } from "../../application/queries/IReview.queries";
import { ProviderServiceQueriesImpl } from "./providerServiceQueries.impl";
import { IBookingQueries } from "../../application/queries/IBooking.queries";
import { ServiceAvailabilityQueriesImpl } from "./serviceAvailabilityQueries.impl";
import { ISubscriptionQueries } from "../../application/queries/ISubscription.queries";
import { IProviderServiceQueries } from "../../application/queries/IProviderService.queries";
import { IServiceAvailabilityQueries } from "../../application/queries/IServiceAvailability.queries";
import { ICreditAccountQueries } from "../../application/queries/ICreditAccount.queries";
import { CreditAccountQueriesImpl } from "./creditAccountQueries.impl";

// booking queries instance
export const bookingQueries: IBookingQueries = new BookingQueriesImpl();

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

// credit account queries instance
export const CreditAccountQueries: ICreditAccountQueries = new CreditAccountQueriesImpl();