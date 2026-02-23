import { s3Client } from "../../infrastructure/lib/aws_s3";
import { kafkaProducer } from "../../infrastructure/messaging";
import { subscriptionMapping } from "../../infrastructure/helpers";
import { paymentServiceClient } from "../../infrastructure/clients";
import { googleTokenService, signedUrlService } from "../../infrastructure/services";
import { FetchAllReviewsUseCase } from "../../application/useCases/common/fetchReviews.useCase";
import { ValidateJoinRoomUsecase } from "../../application/useCases/common/validateJoinRoom.useCase";
import { ProviderFetchAllPlansUseCase } from "../../application/useCases/provider/providerPlan.useCase";
import { FetchAllAppServicesUseCase } from "../../application/useCases/common/fetchAppServices.useCase";
import { FetchSubscriptionDetailsUseCase } from "../../application/useCases/common/subscription.useCase";
import { ProviderStripeConnectUseCase } from "../../application/useCases/provider/providerStripe.useCase";
import { FetchBookingDetailsUsecase } from "../../application/useCases/common/fetchBookingDetails.useCase";
import { FetchProviderProofsUseCase } from "../../application/useCases/common/fetchProviderProofs.useCase";
import { FetchBookingAppointmentsUseCase } from "../../application/useCases/common/fetchAllBookings.useCase";
import { ProviderFetchUserForChatSidebarUseCase } from "../../application/useCases/provider/providerUser.useCase";
import { ProviderChangeReviewRepostStatusUseCase } from "../../application/useCases/provider/providerReview.useCase";
import { ProviderFetchDashboardStatsUseCase } from "../../application/useCases/provider/providerDashboardStats.useCase";
import { ProviderFetchAllSubscriptionsUseCase } from "../../application/useCases/provider/providerSubscription.useCase";
import { ProviderTrialSubscriptionUseCase } from "../../application/useCases/provider/providerTrailSubscription.useCase";
import { UpdateBookingOnlineTrakingUseCase } from "../../application/useCases/common/updateBookingOnlineTracking.useCase";
import { ProviderChangeBookingAppointmentStatusUseCase } from "../../application/useCases/provider/providerBooking.useCase";
import { ProviderSubscriptionCheckoutUseCase } from "../../application/useCases/provider/providerSubscriptionCheckout.useCase";
import { ProviderFetchDashboardGraphDataUseCase } from "../../application/useCases/provider/providerDashboardGraphData.useCase";
import { ProviderCreateAddressUseCase, ProviderFetchAddressUseCase, ProviderUpdateAddressUseCase } from "../../application/useCases/provider/providerAddress.useCase";
import { bookingQueries, paymentQueries, providerServiceQueries, reviewQueries, serviceAvailabilityQueries, subscriptionQueries } from "../../infrastructure/queriesImpls";
import { ProviderCreateServiceAvailabilitiesUseCase, ProviderFetchServiceAvailabilityUseCase } from "../../application/useCases/provider/providerServiceAvailability.useCase";
import { ProviderCreateServiceDetailsUseCase, ProviderFetchServiceDetailsUseCase, ProviderUpdateServiceDetailsUseCase } from "../../application/useCases/provider/providerService.useCase";
import { addressRepository, bookingRepository, planRepository, providerRepository, providerServiceRepository, reviewRepository, serviceAvailabilityRepository, serviceRepository, subscriptionRepository, userRepository } from "../../infrastructure/repositoryImpls";
import { ProvideDeleteIdentityProofUseCase, ProvideDeleteServiceProofUseCase, ProviderFetchProfileDetailsUseCase, ProviderRequestForApprovalUseCase, ProviderUpdateIdentityProofUseCase, ProviderUpdateProfileImageUseCase, ProviderUpdateProviderInfoUseCase, ProviderUpdatePushNotificationUseCase, ProviderUpdateServiceProofUseCase } from "../../application/useCases/provider/providerProfile.useCase";
import { ProviderFetchSubscribedPlanUseCase } from "../../application/useCases/provider/providerFetchSubscribedPlan.useCase";

// provider address controller dependency injection
export const providerFetchAddressUseCase = new ProviderFetchAddressUseCase(addressRepository);
export const providerUpdateAddressUseCase = new ProviderUpdateAddressUseCase(addressRepository);
export const providerCreateAddressUseCase = new ProviderCreateAddressUseCase(providerRepository, addressRepository);

// provider app service controller dependency injection
export const fetchAllAppServicesUseCase = new FetchAllAppServicesUseCase(serviceRepository);

// provider booking controller
export const validateJoinRoomUsecase = new ValidateJoinRoomUsecase(bookingRepository);
export const fetchBookingDetailsUsecase = new FetchBookingDetailsUsecase(bookingQueries);
export const fetchBookingAppointmentsUseCase = new FetchBookingAppointmentsUseCase(bookingQueries);
export const providerChangeBookingAppointmentStatusUseCase = new ProviderChangeBookingAppointmentStatusUseCase(bookingRepository, userRepository, googleTokenService, kafkaProducer);
export const updateBookingOnlineTrakingUseCase = new UpdateBookingOnlineTrakingUseCase(bookingRepository, serviceAvailabilityQueries);

// provider dashboard controller dependency injection
export const providerFetchDashboardStatsUseCase = new ProviderFetchDashboardStatsUseCase(bookingQueries, paymentQueries);
export const providerFetchDashboardGraphDataUseCase = new ProviderFetchDashboardGraphDataUseCase(bookingQueries, subscriptionMapping);

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
export const providerUpdatePushNotificationUseCase = new ProviderUpdatePushNotificationUseCase(providerRepository);

// provider review constroller dependency injection
export const fetchAllReviewsUseCase = new FetchAllReviewsUseCase(reviewQueries, signedUrlService);
export const providerChangeReviewRepostStatusUseCase = new ProviderChangeReviewRepostStatusUseCase(reviewRepository);

// provider service controller dependency injection
export const providerFetchServiceDetailsUseCase = new ProviderFetchServiceDetailsUseCase(providerServiceQueries);
export const providerCreateServiceDetailsUseCase = new ProviderCreateServiceDetailsUseCase(providerRepository, providerServiceRepository);
export const providerUpdateServiceDetailsUseCase = new ProviderUpdateServiceDetailsUseCase(providerServiceRepository);

// provider service availability controller dependency injection
export const providerFetchServiceAvailabilityUseCase = new ProviderFetchServiceAvailabilityUseCase(providerRepository, serviceAvailabilityQueries);
export const providerCreateServiceAvailabilitiesUseCase = new ProviderCreateServiceAvailabilitiesUseCase(providerRepository, serviceAvailabilityRepository);

// provider stripe controller dependency injection
export const providerStripeConnectUseCase = new ProviderStripeConnectUseCase(providerRepository);

// provider subscription controller dependency injection
export const fetchSubscriptionDetailsUseCase = new FetchSubscriptionDetailsUseCase(subscriptionQueries);
export const providerFetchAllSubscriptionsUseCase = new ProviderFetchAllSubscriptionsUseCase(providerRepository, subscriptionQueries);
export const providerTrialSubscriptionUseCase = new ProviderTrialSubscriptionUseCase(providerRepository, subscriptionRepository, planRepository, kafkaProducer);
export const providerSubscriptionCheckoutUseCase = new ProviderSubscriptionCheckoutUseCase(planRepository, providerRepository, subscriptionRepository, paymentServiceClient);
export const providerFetchSubscribedPlanUseCase = new ProviderFetchSubscribedPlanUseCase(providerRepository, subscriptionQueries);

// provider user controller dependency injection
export const providerFetchUserForChatSidebarUseCase = new ProviderFetchUserForChatSidebarUseCase(signedUrlService, bookingQueries);



