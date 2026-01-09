// **** Repository instance **** //

import { PlanRepositoryImpl } from "./plan/plan.repository.impl";
import { UserRepositoryImpl } from "./user/user.repository.impl";
import { ReviewRepositoryImpl } from "./review/review.repository.impl";
import { AddressRepositoryImpl } from "./address/address.repository.impl";
import { BookingRepositoryImpl } from "./booking/booking.repository.impl";
import { PaymentRepositoryImpl } from "./payment/payment.repository.impl";
import { ServiceRepositoryImpl } from "./service/service.repository.impl";
import { ProviderRepositoryImpl } from "./provider/provider.repository.impl";
import { CredentialRepositoryImpl } from "./credential/credential.repository.impl";
import { IPlanRepository } from "../../domain/interfaces/repositories/IPlan.repository";
import { IUserRepository } from "../../domain/interfaces/repositories/IUser.repository";
import { SubscriptionRepositoryImpl } from "./subscription/subscription.repository.impl";
import { IReviewRepository } from "../../domain/interfaces/repositories/IReview.repository";
import { IAddressRepository } from "../../domain/interfaces/repositories/IAddress.repository";
import { IBookingRepository } from "../../domain/interfaces/repositories/IBooking.repository";
import { IPaymentRepository } from "../../domain/interfaces/repositories/IPayment.repository";
import { IServiceRepository } from "../../domain/interfaces/repositories/IService.repository";
import { IProviderRepository } from "../../domain/interfaces/repositories/IProvider.repository";
import { ProviderServiceRepositoryImpl } from "./providerService/providerService.repository.impl";
import { ICredentialRepository } from "../../domain/interfaces/repositories/ICredentialRepository";
import { ISubscriptionRepository } from "../../domain/interfaces/repositories/ISubscription.repository";
import { IProviderServiceRepository } from "../../domain/interfaces/repositories/IProviderService.repository";
import { ServiceAvailabilityRepositoryImpl } from "./serviceAvailability/serviceAvailability.repository.impl";
import { IServiceAvailabilityRepository } from "../../domain/interfaces/repositories/IServiceAvailability.repository";

// address repository instance
export const addressRepository: IAddressRepository = new AddressRepositoryImpl();

// booking repository instance
export const bookingRepository: IBookingRepository = new BookingRepositoryImpl();

// credential repository instance
export const credentialRepository: ICredentialRepository = new CredentialRepositoryImpl();

// payment repository instance
export const paymentRepository: IPaymentRepository = new PaymentRepositoryImpl();

// plan repository instance
export const planRepository: IPlanRepository = new PlanRepositoryImpl();

// provider repository instance
export const providerRepository: IProviderRepository = new ProviderRepositoryImpl();

// provider service repository instance
export const providerServiceRepository: IProviderServiceRepository = new ProviderServiceRepositoryImpl();

// review repository instance
export const reviewRepository: IReviewRepository = new ReviewRepositoryImpl();

// service repository instance
export const serviceRepository: IServiceRepository = new ServiceRepositoryImpl();

// service availability repository instance
export const serviceAvailabilityRepository: IServiceAvailabilityRepository = new ServiceAvailabilityRepositoryImpl();

// subscription repository instance
export const subscriptionRepository: ISubscriptionRepository = new SubscriptionRepositoryImpl();

// user repository instance
export const userRepository: IUserRepository = new UserRepositoryImpl();
