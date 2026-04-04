import { kafkaProducer } from "../../infrastructure/messaging";
import { s3Client } from "../../infrastructure/cloud/aws/aws_s3";
import { subscriptionMapping } from "../../infrastructure/helpers";
import { paymentServiceClient } from "../../infrastructure/clients";
import { cacheService, signedUrlService } from "../../infrastructure/services";
import { AdminProviderListUseCase } from "../../application/useCases/provider/getProviders.useCase";
import { FetchStatsUseCase } from "../../application/useCases/provider/dashboard/fetchStats.useCase";
import { FetchProviderProofsUseCase } from "../../application/useCases/common/fetchProviderProofs.useCase";
import { TrialSubscriptionUseCase } from "../../application/useCases/subscription/trailSubscription.useCase";
import { FetchGraphDataUseCase } from "../../application/useCases/provider/dashboard/fetchGraphData.useCase";
import { GetSubscribedPlanUseCase } from "../../application/useCases/subscription/getSubscribedPlan.useCase";
import { GetProvidersForChatUseCase } from "../../application/useCases/provider/getProvidersForChat.useCase";
import { AdminRejectProviderUseCase } from "../../application/useCases/provider/adminRejectProvider.useCase";
import { AdminApproveProviderUseCase } from "../../application/useCases/provider/adminApproveProvider.useCase";
import { GetProvidersByFilterUseCase } from "../../application/useCases/provider/getProvidersByFilter.useCase";
import { ProviderFetchUserForChatSidebarUseCase } from "../../application/useCases/provider/providerUser.useCase";
import { planRepository, providerRepository, subscriptionRepository } from "../../infrastructure/repositoryImpls";
import { SubscriptionCheckoutUseCase } from "../../application/useCases/subscription/subscriptionCheckout.useCase";
import { ChangeProviderTrustTagUseCase } from "../../application/useCases/provider/changeProviderTrustTag.useCase";
import { GetServiceAvailabilityUseCase } from "../../application/useCases/serviceAvailability/getServiceAvailability";
import { UserFetchProviderDetailsUseCase } from "../../application/useCases/provider/userFetchProviderDetails.useCase";
import { AdminFetchProviderDetailsUseCase } from "../../application/useCases/provider/adminFetchProviderDetails.useCase";
import { ChangeProviderBlockStatusUseCase } from "../../application/useCases/provider/changeProviderBlockStatus.useCase";
import { bookingQueries, providerServiceQueries, serviceAvailabilityQueries, subscriptionQueries } from "../../infrastructure/queriesImpls";
import { ProvideDeleteIdentityProofUseCase, ProvideDeleteServiceProofUseCase, ProviderFetchProfileDetailsUseCase, ProviderRequestForApprovalUseCase, ProviderUpdateIdentityProofUseCase, ProviderUpdateProfileImageUseCase, ProviderUpdateProviderInfoUseCase, ProviderUpdatePushNotificationUseCase, ProviderUpdateServiceProofUseCase } from "../../application/useCases/provider/providerProfile.useCase";


// provider dashboard controller dependency injection
export const fetchStatsUseCase = new FetchStatsUseCase(bookingQueries);
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

// provider service availability controller dependency injection
export const getServiceAvailabilityUseCase = new GetServiceAvailabilityUseCase(providerRepository, serviceAvailabilityQueries);

// provider subscription controller dependency injection
export const trialSubscriptionUseCase = new TrialSubscriptionUseCase(providerRepository, subscriptionRepository, planRepository, kafkaProducer);
export const subscriptionCheckoutUseCase = new SubscriptionCheckoutUseCase(planRepository, providerRepository, subscriptionRepository, paymentServiceClient);
export const getSubscribedPlanUseCase = new GetSubscribedPlanUseCase(providerRepository, subscriptionQueries);

// provider user controller dependency injection
export const providerFetchUserForChatSidebarUseCase = new ProviderFetchUserForChatSidebarUseCase(signedUrlService, bookingQueries);



export const getProvidersByFilterUseCase = new GetProvidersByFilterUseCase(signedUrlService, providerServiceQueries);

export const adminProviderListUseCase = new AdminProviderListUseCase(providerRepository);

export const getProvidersForChatUseCase = new GetProvidersForChatUseCase(signedUrlService, bookingQueries);

export const adminApproveProviderUseCase = new AdminApproveProviderUseCase(providerRepository, kafkaProducer);
export const adminRejectProviderUseCase = new AdminRejectProviderUseCase(providerRepository, kafkaProducer);
export const changeProviderBlockStatusUseCase = new ChangeProviderBlockStatusUseCase(providerRepository, kafkaProducer, cacheService);
export const changeProviderTrustTagUseCase = new ChangeProviderTrustTagUseCase(providerRepository, kafkaProducer);