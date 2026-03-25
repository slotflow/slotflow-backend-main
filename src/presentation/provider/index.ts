import { s3Client } from "../../infrastructure/lib/aws_s3";
import { kafkaProducer } from "../../infrastructure/messaging";
import { subscriptionMapping } from "../../infrastructure/helpers";
import { paymentServiceClient } from "../../infrastructure/clients";
import { signedUrlService } from "../../infrastructure/services";
import { FetchProviderProofsUseCase } from "../../application/useCases/common/fetchProviderProofs.useCase";
import { ProviderFetchUserForChatSidebarUseCase } from "../../application/useCases/provider/providerUser.useCase";
import { FetchStatsUseCase } from "../../application/useCases/provider/dashboard/fetchStats.useCase";
import { TrialSubscriptionUseCase } from "../../application/useCases/subscription/trailSubscription.useCase";
import { SubscriptionCheckoutUseCase } from "../../application/useCases/subscription/subscriptionCheckout.useCase";
import { bookingQueries, paymentQueries, providerServiceQueries, serviceAvailabilityQueries, subscriptionQueries } from "../../infrastructure/queriesImpls";
import { ProviderCreateServiceDetailsUseCase, ProviderFetchServiceDetailsUseCase, ProviderUpdateServiceDetailsUseCase } from "../../application/useCases/provider/providerService.useCase";
import { planRepository, providerRepository, providerServiceRepository, subscriptionRepository } from "../../infrastructure/repositoryImpls";
import { ProvideDeleteIdentityProofUseCase, ProvideDeleteServiceProofUseCase, ProviderFetchProfileDetailsUseCase, ProviderRequestForApprovalUseCase, ProviderUpdateIdentityProofUseCase, ProviderUpdateProfileImageUseCase, ProviderUpdateProviderInfoUseCase, ProviderUpdatePushNotificationUseCase, ProviderUpdateServiceProofUseCase } from "../../application/useCases/provider/providerProfile.useCase";
import { GetSubscribedPlanUseCase } from "../../application/useCases/subscription/getSubscribedPlan.useCase";
import { AdminFetchProviderDetailsUseCase } from "../../application/useCases/provider/adminFetchProviderDetails.useCase";
import { UserFetchProviderDetailsUseCase } from "../../application/useCases/provider/userFetchProviderDetails.useCase";
import { GetServiceAvailabilityUseCase } from "../../application/useCases/serviceAvailability/getServiceAvailability";
import { FetchGraphDataUseCase } from "../../application/useCases/provider/dashboard/fetchGraphData.useCase";


// provider dashboard controller dependency injection
export const fetchStatsUseCase = new FetchStatsUseCase(bookingQueries, paymentQueries);
export const fetchGraphDataUseCase = new FetchGraphDataUseCase(bookingQueries, subscriptionMapping);

// provider profile constroller dependency injection
export const providerUpdateProviderInfoUseCase = new ProviderUpdateProviderInfoUseCase(providerRepository);
export const providerRequestForApprovalUseCase = new ProviderRequestForApprovalUseCase(providerRepository);
export const providerFetchProfileDetailsUseCase = new ProviderFetchProfileDetailsUseCase(providerRepository);
export const adminFetchProviderDetailsUseCase = new AdminFetchProviderDetailsUseCase(providerRepository, signedUrlService);
export const userFetchProviderDetailsUseCase = new UserFetchProviderDetailsUseCase(providerRepository, signedUrlService);
export const fetchProviderProofsUseCase = new FetchProviderProofsUseCase(signedUrlService, providerRepository);
export const providerUpdateProfileImageUseCase = new ProviderUpdateProfileImageUseCase(providerRepository, signedUrlService);
export const providerUpdateServiceProofUseCase = new ProviderUpdateServiceProofUseCase(providerRepository, signedUrlService);
export const providerUpdateIdentityProofUseCase = new ProviderUpdateIdentityProofUseCase(providerRepository, signedUrlService);
export const provideDeleteServiceProofUseCase = new ProvideDeleteServiceProofUseCase(s3Client, providerRepository, signedUrlService);
export const provideDeleteIdentityProofUseCase = new ProvideDeleteIdentityProofUseCase(s3Client, providerRepository, signedUrlService);
export const providerUpdatePushNotificationUseCase = new ProviderUpdatePushNotificationUseCase(providerRepository);

// provider service controller dependency injection
export const providerFetchServiceDetailsUseCase = new ProviderFetchServiceDetailsUseCase(providerServiceQueries);
export const providerCreateServiceDetailsUseCase = new ProviderCreateServiceDetailsUseCase(providerRepository, providerServiceRepository);
export const providerUpdateServiceDetailsUseCase = new ProviderUpdateServiceDetailsUseCase(providerServiceRepository);

// provider service availability controller dependency injection
export const getServiceAvailabilityUseCase = new GetServiceAvailabilityUseCase(providerRepository, serviceAvailabilityQueries);

// provider subscription controller dependency injection
export const trialSubscriptionUseCase = new TrialSubscriptionUseCase(providerRepository, subscriptionRepository, planRepository, kafkaProducer);
export const subscriptionCheckoutUseCase = new SubscriptionCheckoutUseCase(planRepository, providerRepository, subscriptionRepository, paymentServiceClient);
export const getSubscribedPlanUseCase = new GetSubscribedPlanUseCase(providerRepository, subscriptionQueries);

// provider user controller dependency injection
export const providerFetchUserForChatSidebarUseCase = new ProviderFetchUserForChatSidebarUseCase(signedUrlService, bookingQueries);



