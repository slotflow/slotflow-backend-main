import { s3Client } from "../../infrastructure/lib/aws_s3";
import { FetchAllReviewsUseCase } from "../../application/useCases/common/fetchReviews.useCase";
import { ValidateJoinRoomUsecase } from "../../application/useCases/common/validateJoinRoom.useCase";
import { ProviderFetchAllPlansUseCase } from "../../application/useCases/provier/providerPlan.useCase";
import { FetchSubscriptionDetailsUseCase } from "../../application/useCases/common/subscription.useCase";
import { ProviderStripeConnectUseCase } from "../../application/useCases/provier/providerStripe.useCase";
import { FetchBookingDetailsUsecase } from "../../application/useCases/common/fetchBookingDetails.useCase";
import { FetchProviderProofsUseCase } from "../../application/useCases/common/fetchProviderProofs.useCase";
import { FetchBookingAppointmentsUseCase } from "../../application/useCases/common/fetchAllBookings.useCase";
import { ProviderFetchAllPaymentsUseCase } from "../../application/useCases/provier/providerPayment.useCase";
import { ProviderFetchUserForChatSidebarUseCase } from "../../application/useCases/provier/providerUser.useCase";
import { ProviderFetchAllAppServicesUseCase } from "../../application/useCases/provier/providerAppServices.useCase";
import { ProviderChangeReviewRepostStatusUseCase } from "../../application/useCases/provier/providerReview.useCase";
import { ProviderFetchDashboardStatsUseCase } from "../../application/useCases/provier/providerDashboardStats.useCase";
import { ProviderFetchAllSubscriptionsUseCase } from "../../application/useCases/provier/providerSubscription.useCase";
import { ProviderTrialSubscriptionUseCase } from "../../application/useCases/provier/providerTrailSubscription.useCase";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/useCases/common/updateBookingOnlineTracking.useCase";
import { ProviderChangeBookingAppointmentStatusUseCase } from "../../application/useCases/provier/providerBooking.useCase";
import { ProviderFetchDashboardGraphDataUseCase } from "../../application/useCases/provier/providerDashboardGraphData.useCase";
import { ProviderCreateAddressUseCase, ProviderFetchAddressUseCase, ProviderUpdateAddressUseCase } from "../../application/useCases/provier/providerAddress.useCase";
import { ProviderSaveSubscriptionUseCase, ProviderStripeSubscriptionCreateSessionIdUseCase } from "../../application/useCases/provier/providerStripeSubscription.useCase";
import { ProviderCreateServiceAvailabilitiesUseCase, ProviderFetchServiceAvailabilityUseCase } from "../../application/useCases/provier/providerServiceAvailability.useCase";
import { ProviderCreateServiceDetailsUseCase, ProviderFetchServiceDetailsUseCase, ProviderUpdateServiceDetailsUseCase } from "../../application/useCases/provier/providerService.useCase";
import { ProvideDeleteIdentityProofUseCase, ProvideDeleteServiceProofUseCase, ProviderFetchProfileDetailsUseCase, ProviderRequestForApprovalUseCase, ProviderUpdateIdentityProofUseCase, ProviderUpdateProfileImageUseCase, ProviderUpdateProviderInfoUseCase, ProviderUpdateServiceProofUseCase } from "../../application/useCases/provier/providerProfile.useCase";
import { addressRepository, bookingQueries, bookingRepository, kafkaService, paymentQueries, paymentRepository, planRepository, providerRepository, providerServiceQueries, providerServiceRepository, reviewQueries, reviewRepository, serviceAvailabilityQueries, serviceAvailabilityRepository, serviceRepository, signedUrlService, subscriptionMapping, subscriptionQueries, subscriptionRepository, userRepository } from "../../infrastructure/container";

// provider address controller dependency injection
export const providerFetchAddressUseCase = new ProviderFetchAddressUseCase(addressRepository);
export const providerUpdateAddressUseCase = new ProviderUpdateAddressUseCase(addressRepository);
export const providerCreateAddressUseCase = new ProviderCreateAddressUseCase(providerRepository, addressRepository);

// provider app service controller dependency injection
export const providerFetchAllServicesUseCase = new ProviderFetchAllAppServicesUseCase(serviceRepository);

// provider booking controller
export const validateJoinRoomUsecase = new ValidateJoinRoomUsecase(bookingRepository);
export const fetchBookingDetailsUsecase = new FetchBookingDetailsUsecase(bookingQueries);
export const fetchBookingAppointmentsUseCase = new FetchBookingAppointmentsUseCase(bookingQueries);
export const providerChangeBookingAppointmentStatusUseCase = new ProviderChangeBookingAppointmentStatusUseCase(bookingRepository, kafkaService, userRepository);
export const updateBookingOnlineTrakingUseCase = new UpdateBookingOnlineTrakingUseCase(bookingRepository, serviceAvailabilityQueries);

// provider dashboard controller dependency injection
export const providerFetchDashboardStatsUseCase = new ProviderFetchDashboardStatsUseCase(bookingQueries, paymentQueries);
export const providerFetchDashboardGraphDataUseCase = new ProviderFetchDashboardGraphDataUseCase(bookingQueries, subscriptionMapping);

// provider payment controller dependency injection
export const providerFetchAllPaymentsUseCase = new ProviderFetchAllPaymentsUseCase(paymentRepository);

// provider plan controller dependency injection
export const providerFetchAllPlansUseCase = new ProviderFetchAllPlansUseCase(planRepository);

// provider profile constroller dependency injection
export const providerUpdateProviderInfoUseCase = new ProviderUpdateProviderInfoUseCase(providerRepository);
export const providerRequestForApprovalUseCase = new ProviderRequestForApprovalUseCase(providerRepository);
export const providerFetchProfileDetailsUseCase = new ProviderFetchProfileDetailsUseCase(providerRepository);
export const fetchProviderProofsUseCase = new FetchProviderProofsUseCase(signedUrlService, providerRepository);
export const providerUpdateProfileImageUseCase = new ProviderUpdateProfileImageUseCase(providerRepository, signedUrlService);
export const providerUpdateServiceProofUseCase = new ProviderUpdateServiceProofUseCase(providerRepository, signedUrlService);
export const providerUpdateIdentityProofUseCase = new ProviderUpdateIdentityProofUseCase(providerRepository, signedUrlService);
export const provideDeleteServiceProofUseCase = new ProvideDeleteServiceProofUseCase(s3Client, providerRepository, signedUrlService);
export const provideDeleteIdentityProofUseCase = new ProvideDeleteIdentityProofUseCase(s3Client, providerRepository, signedUrlService);

// provider review constroller dependency injection
export const fetchAllReviewsUseCase = new FetchAllReviewsUseCase(reviewQueries, signedUrlService);
export const providerChangeReviewRepostStatusUseCase = new ProviderChangeReviewRepostStatusUseCase(reviewRepository);

// provider service controller dependency injection
export const providerFetchServiceDetailsUseCase = new ProviderFetchServiceDetailsUseCase(providerServiceQueries);
export const providerCreateServiceDetailsUseCase = new ProviderCreateServiceDetailsUseCase(providerRepository, providerServiceRepository);
export const providerUpdateServiceDetailsUseCase = new ProviderUpdateServiceDetailsUseCase(providerServiceRepository);

// provider service availability controller dependency injection
export const providerFetchServiceAvailabilityUseCase = new ProviderFetchServiceAvailabilityUseCase(serviceAvailabilityQueries);
export const providerCreateServiceAvailabilitiesUseCase = new ProviderCreateServiceAvailabilitiesUseCase(providerRepository, serviceAvailabilityRepository);

// provider stripe controller dependency injection
export const providerStripeConnectUseCase = new ProviderStripeConnectUseCase(providerRepository);

// provider subscription controller dependency injection
export const fetchSubscriptionDetailsUseCase = new FetchSubscriptionDetailsUseCase(subscriptionQueries);
export const providerFetchAllSubscriptionsUseCase = new ProviderFetchAllSubscriptionsUseCase(providerRepository, subscriptionQueries);
export const providerTrialSubscriptionUseCase = new ProviderTrialSubscriptionUseCase(providerRepository, subscriptionRepository, planRepository);
export const providerSaveSubscriptionUseCase = new ProviderSaveSubscriptionUseCase(providerRepository, paymentRepository, subscriptionRepository, kafkaService);
export const providerStripeSubscriptionCreateSessionIdUseCase = new ProviderStripeSubscriptionCreateSessionIdUseCase(planRepository, providerRepository, subscriptionRepository);

// provider user controller dependency injection
export const providerFetchUserForChatSidebarUseCase = new ProviderFetchUserForChatSidebarUseCase(signedUrlService, bookingQueries);



