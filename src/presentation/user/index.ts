import { s3Client } from "../../infrastructure/lib/aws_s3";
import { UserCancelBookingUseCase } from "../../application/useCases/user/userBooking.useCase";
import { FetchAllReviewsUseCase } from "../../application/useCases/common/fetchReviews.useCase";
import { UserFetchAllPaymentsUseCase } from "../../application/useCases/user/userPayment.useCase";
import { ValidateJoinRoomUsecase } from "../../application/useCases/common/validateJoinRoom.useCase";
import { UserFetchAllAppServiceUseCase } from "../../application/useCases/user/userAppService.useCase";
import { FetchBookingDetailsUsecase } from "../../application/useCases/common/fetchBookingDetails.useCase";
import { FetchBookingAppointmentsUseCase } from "../../application/useCases/common/fetchAllBookings.useCase";
import { CreateReviewUseCase, DeleteReviewUseCase } from "../../application/useCases/user/userReview.useCase";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/useCases/common/updateBookingOnlineTracking.useCase";
import { UserCreateAddressUseCase, UserFetchAddressUseCase, UserUpdateAddressUseCase } from "../../application/useCases/user/userAddress.useCase";
import { UserAppointmentBookingViaStripeUseCase, UserSaveBookingAfterStripePaymentUseCase } from "../../application/useCases/user/userStripeBooking.useCase";
import { UserFetchProfileDetailsUseCase, UserUpdateProfileImageUseCase, UserUpdateProviderInfoUseCase } from "../../application/useCases/user/userProfile.useCase";
import { UserFetchProvidersForChatSidebarUseCase, UserFetchServiceProviderAddressUseCase, UserFetchServiceProviderProfileDetailsUseCase, UserFetchServiceProviderServiceAvailabilityUseCase, UserFetchServiceProviderServiceDetailsUseCase, UserFetchServiceProvidersUseCase } from "../../application/useCases/user/userProvider.useCase";
import { addressRepository, bookingQueries, bookingRepository, googleCalendarGatewayService, googleTokenService, kafkaService, paymentRepository, providerRepository, providerServiceQueries, reviewQueries, reviewRepository, serviceAvailabilityQueries, serviceRepository, signedUrlService, userRepository } from "../../infrastructure/container";

// user address controller dependency injection
export const userUpdateAddressUseCase = new UserUpdateAddressUseCase(addressRepository);
export const userFetchAddressUseCase = new UserFetchAddressUseCase(userRepository, addressRepository);
export const userCreateAddressUseCase = new UserCreateAddressUseCase(userRepository, addressRepository);

// user app service controller dependency injection
export const userFetchAllAppServiceUseCase = new UserFetchAllAppServiceUseCase(serviceRepository);

// user booking controller dependency injection
export const validateJoinRoomUsecase = new ValidateJoinRoomUsecase(bookingRepository)
export const fetchBookingDetailsUsecase = new FetchBookingDetailsUsecase(bookingQueries);
export const fetchBookingAppointmentsUseCase = new FetchBookingAppointmentsUseCase(bookingQueries);
export const userCancelBookingUseCase = new UserCancelBookingUseCase(userRepository, bookingRepository, paymentRepository);
export const updateBookingOnlineTrakingUseCase = new UpdateBookingOnlineTrakingUseCase(bookingRepository, serviceAvailabilityQueries);
export const userAppointmentBookingViaStrpieUseCase = new UserAppointmentBookingViaStripeUseCase(providerRepository, bookingRepository, providerServiceQueries, serviceAvailabilityQueries);
export const userSaveBookingAfterStripePaymentUseCase = new UserSaveBookingAfterStripePaymentUseCase(userRepository, paymentRepository, bookingRepository, serviceAvailabilityQueries, providerRepository, kafkaService, googleCalendarGatewayService, googleTokenService);

// user payment controller dependency injection
export const userFetchAllPaymentsUseCase = new UserFetchAllPaymentsUseCase(userRepository, paymentRepository);

// user profile controller dependency injection
export const userUpdateProviderInfoUseCase = new UserUpdateProviderInfoUseCase(userRepository);
export const userFetchProfileDetailsUseCase = new UserFetchProfileDetailsUseCase(userRepository);
export const userUpdateProfileImageUseCase = new UserUpdateProfileImageUseCase(s3Client, userRepository, signedUrlService);

// user provider controller dependency injection
export const userFetchProvidersForChatSidebarUseCase = new UserFetchProvidersForChatSidebarUseCase(signedUrlService, bookingQueries);
export const userFetchServiceProviderAddressUseCase = new UserFetchServiceProviderAddressUseCase(userRepository, addressRepository);
export const userFetchServiceProvidersUseCase = new UserFetchServiceProvidersUseCase(userRepository, signedUrlService, providerServiceQueries);
export const userFetchServiceProviderServiceDetailsUseCase = new UserFetchServiceProviderServiceDetailsUseCase(userRepository, providerServiceQueries);
export const userFetchServiceProviderProfileDetailsUseCase = new UserFetchServiceProviderProfileDetailsUseCase(userRepository, providerRepository, signedUrlService);
export const userFetchServiceProviderServiceAvailabilityUseCase = new UserFetchServiceProviderServiceAvailabilityUseCase(providerRepository, userRepository, serviceAvailabilityQueries);

// user review controller dependency injection
export const createReviewUseCase = new CreateReviewUseCase(reviewRepository);
export const deleteReviewUseCase = new DeleteReviewUseCase(reviewRepository);
export const fetchAllReviewsUseCase = new FetchAllReviewsUseCase(reviewQueries, signedUrlService);

