// Queries instance

import { UserQueriesImpl } from "./userQueries.impl";
import { ReviewQueriesImpl } from "./reviewQueries.impl";
import { BookingQueriesImpl } from "./bookingQueries.impl";
import { ReferralQueriesImpl } from "./referralQueries.impls";
import { SubscriptionQueriesImpl } from "./subscriptionQueries.impl";
import { IUserQueries } from "../../application/queries/IUser.queries";
import { CreditAccountQueriesImpl } from "./creditAccountQueries.impl";
import { IReviewQueries } from "../../application/queries/IReview.queries";
import { ProviderServiceQueriesImpl } from "./providerServiceQueries.impl";
import { IBookingQueries } from "../../application/queries/IBooking.queries";
import { IReferralQueries } from "../../application/queries/IReferral.queries";
import { ServiceAvailabilityQueriesImpl } from "./serviceAvailabilityQueries.impl";
import { ISubscriptionQueries } from "../../application/queries/ISubscription.queries";
import { ICreditAccountQueries } from "../../application/queries/ICreditAccount.queries";
import { IProviderServiceQueries } from "../../application/queries/IProviderService.queries";
import { IServiceAvailabilityQueries } from "../../application/queries/IServiceAvailability.queries";

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
export const creditAccountQueries: ICreditAccountQueries = new CreditAccountQueriesImpl();

// referral queries instance
export const referralQueries: IReferralQueries = new ReferralQueriesImpl();