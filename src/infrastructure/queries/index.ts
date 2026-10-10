// Queries instance

import { UserQueriesImpl } from "./user.queries.impl";
import { ReviewQueriesImpl } from "./review.queries.impl";
import { BookingQueriesImpl } from "./booking.queries.impl";
import { ReferralQueriesImpl } from "./referral.queries.impls";
import { SubscriptionQueriesImpl } from "./subscription.queries.impl";
import { IUserQueries } from "../../application/interfaces/queries/IUser.queries";
import { CreditAccountQueriesImpl } from "./creditAccount.queries.impl";
import { IReviewQueries } from "../../application/interfaces/queries/IReview.queries";
import { ProviderServiceQueriesImpl } from "./providerService.queries.impl";
import { IBookingQueries } from "../../application/interfaces/queries/IBooking.queries";
import { IReferralQueries } from "../../application/interfaces/queries/IReferral.queries";
import { ServiceAvailabilityQueriesImpl } from "./serviceAvailability.queries.impl";
import { ISubscriptionQueries } from "../../application/interfaces/queries/ISubscription.queries";
import { ICreditAccountQueries } from "../../application/interfaces/queries/ICreditAccount.queries";
import { IProviderServiceQueries } from "../../application/interfaces/queries/IProviderService.queries";
import { IServiceAvailabilityQueries } from "../../application/interfaces/queries/IServiceAvailability.queries";

// booking queries instance
export const bookingQueries: IBookingQueries = new BookingQueriesImpl();

// provider service querues instance
export const providerServiceQueries: IProviderServiceQueries = new ProviderServiceQueriesImpl();

// review queries instance
export const reviewQueries: IReviewQueries = new ReviewQueriesImpl();

// service availability queries instance
export const serviceAvailabilityQueries: IServiceAvailabilityQueries =
  new ServiceAvailabilityQueriesImpl();

// subscription queries instance
export const subscriptionQueries: ISubscriptionQueries = new SubscriptionQueriesImpl();

// user queries instance
export const userQueries: IUserQueries = new UserQueriesImpl();

// credit account queries instance
export const creditAccountQueries: ICreditAccountQueries = new CreditAccountQueriesImpl();

// referral queries instance
export const referralQueries: IReferralQueries = new ReferralQueriesImpl();
