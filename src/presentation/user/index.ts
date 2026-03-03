import { UserCancelBookingUseCase } from "../../application/useCases/booking/cancelBooking.useCase";
import { UserFetchAllPaymentsUseCase } from "../../application/useCases/user/userPayment.useCase";
import { FetchAllAppServicesUseCase } from "../../application/useCases/common/fetchAppServices.useCase";
import { googleCalendarGatewayService, googleTokenService, signedUrlService } from "../../infrastructure/services";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/useCases/booking/updateBookingOnlineTracking.useCase";
import { bookingQueries, providerServiceQueries, reviewQueries, serviceAvailabilityQueries } from "../../infrastructure/queriesImpls";
import { UserCreateAddressUseCase, UserFetchAddressUseCase, UserUpdateAddressUseCase } from "../../application/useCases/user/userAddress.useCase";
import { addressRepository, bookingRepository, paymentRepository, providerRepository, reviewRepository, serviceRepository, userRepository } from "../../infrastructure/repositoryImpls";
import { UserFetchProfileDetailsUseCase, UserUpdateProfileImageUseCase, UserUpdateProviderInfoUseCase, UserUpdatePushNotificationUseCase } from "../../application/useCases/user/userProfile.useCase";
import { UserFetchProvidersForChatSidebarUseCase, UserFetchServiceProviderAddressUseCase, UserFetchServiceProviderProfileDetailsUseCase, UserFetchServiceProviderServiceAvailabilityUseCase, UserFetchServiceProviderServiceDetailsUseCase, UserFetchServiceProvidersUseCase } from "../../application/useCases/user/userProvider.useCase";
import { paymentServiceClient } from "../../infrastructure/clients";


// user address controller dependency injection
export const userUpdateAddressUseCase = new UserUpdateAddressUseCase(addressRepository);
export const userFetchAddressUseCase = new UserFetchAddressUseCase(userRepository, addressRepository);
export const userCreateAddressUseCase = new UserCreateAddressUseCase(userRepository, addressRepository);

// user app service controller dependency injection
export const fetchAllAppServicesUseCase = new FetchAllAppServicesUseCase(serviceRepository);

// user booking controller dependency injection
export const updateBookingOnlineTrakingUseCase = new UpdateBookingOnlineTrakingUseCase(bookingRepository, serviceAvailabilityQueries);
export const userCancelBookingUseCase = new UserCancelBookingUseCase(userRepository, bookingRepository, paymentRepository, googleCalendarGatewayService, googleTokenService);

// user payment controller dependency injection
export const userFetchAllPaymentsUseCase = new UserFetchAllPaymentsUseCase(userRepository, paymentRepository);

// user profile controller dependency injection
export const userUpdateProviderInfoUseCase = new UserUpdateProviderInfoUseCase(userRepository);
export const userFetchProfileDetailsUseCase = new UserFetchProfileDetailsUseCase(userRepository);
export const userUpdateProfileImageUseCase = new UserUpdateProfileImageUseCase(userRepository, signedUrlService);
export const userUpdatePushNotificationUseCase = new UserUpdatePushNotificationUseCase(userRepository);

// user provider controller dependency injection
export const userFetchServiceProviderAddressUseCase = new UserFetchServiceProviderAddressUseCase(addressRepository);
export const userFetchServiceProvidersUseCase = new UserFetchServiceProvidersUseCase(signedUrlService, providerServiceQueries);
export const userFetchProvidersForChatSidebarUseCase = new UserFetchProvidersForChatSidebarUseCase(signedUrlService, bookingQueries);
export const userFetchServiceProviderServiceDetailsUseCase = new UserFetchServiceProviderServiceDetailsUseCase(providerServiceQueries);
export const userFetchServiceProviderProfileDetailsUseCase = new UserFetchServiceProviderProfileDetailsUseCase(providerRepository, signedUrlService);
export const userFetchServiceProviderServiceAvailabilityUseCase = new UserFetchServiceProviderServiceAvailabilityUseCase(providerRepository, serviceAvailabilityQueries);
