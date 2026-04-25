// Repository instance

import { PlanRepositoryImpl } from "./plan.repository.impl";
import { UserRepositoryImpl } from "./user.repository.impl";
import { ReviewRepositoryImpl } from "./review.repository.impl";
import { AddressRepositoryImpl } from "./address.repository.impl";
import { BookingRepositoryImpl } from "./booking.repository.impl";
import { ServiceRepositoryImpl } from "./service.repository.impl";
import { CredentialRepositoryImpl } from "./credential.repository.impl";
import { SubscriptionRepositoryImpl } from "./subscription.repository.impl";
import { ProviderServiceRepositoryImpl } from "./providerService.repository.impl";
import { ServiceAvailabilityRepositoryImpl } from "./serviceAvailability.repository.impl";

import { ProviderProfileRepositoryImpl } from "./providerProfile.repository.impl";
import { IPlanRepository } from "../../domain/interfaces/repositories/IPlan.repository";
import { IUserRepository } from "../../domain/interfaces/repositories/IUser.repository";
import { IReviewRepository } from "../../domain/interfaces/repositories/IReview.repository";
import { IBookingRepository } from "../../domain/interfaces/repositories/IBooking.repository";
import { IAddressRepository } from "../../domain/interfaces/repositories/IAddress.repository";
import { IServiceRepository } from "../../domain/interfaces/repositories/IService.repository";
import { ICredentialRepository } from "../../domain/interfaces/repositories/ICredentialRepository";
import { ISubscriptionRepository } from "../../domain/interfaces/repositories/ISubscription.repository";
import { IProviderServiceRepository } from "../../domain/interfaces/repositories/IProviderService.repository";
import { IProviderProfileRepository } from "../../domain/interfaces/repositories/IProviderProfile.repository";
import { IServiceAvailabilityRepository } from "../../domain/interfaces/repositories/IServiceAvailability.repository";
import { IProcessedEventRepository } from "../../domain/interfaces/repositories/IProcessedEvent.repository";
import { ProcessedEventRepositoryImpl } from "./processedEvent.repository.impl";

// address repository instance
export const addressRepository: IAddressRepository = new AddressRepositoryImpl();

// booking repository instance
export const bookingRepository: IBookingRepository = new BookingRepositoryImpl();

// credential repository instance
export const credentialRepository: ICredentialRepository = new CredentialRepositoryImpl();

// plan repository instance
export const planRepository: IPlanRepository = new PlanRepositoryImpl();

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

// provider profile repository instance
export const providerProfileRepository: IProviderProfileRepository = new ProviderProfileRepositoryImpl();

// processed event repository instance
export const processedEventRepository: IProcessedEventRepository = new ProcessedEventRepositoryImpl();