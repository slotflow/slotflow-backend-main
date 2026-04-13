import { kafkaProducer } from "../../infrastructure/messaging";
import { s3Client } from "../../infrastructure/cloud/aws/aws_s3";
import { subscriptionMapping } from "../../infrastructure/helpers";
import { paymentServiceClient } from "../../infrastructure/clients";
import { cacheService, signedUrlService } from "../../infrastructure/services";
import { AdminProviderListUseCase } from "../../application/useCases/provider/getProviders.useCase";
import { GetStatsUseCase } from "../../application/useCases/provider/dashboard/getStats.useCase";
import { GetProviderProofsUseCase } from "../../application/useCases/common/getProviderProofs.useCase";
import { TrialSubscriptionUseCase } from "../../application/useCases/subscription/trailSubscription.useCase";
import { GetGraphDataUseCase } from "../../application/useCases/provider/dashboard/getGraphData.useCase";
import { GetSubscribedPlanUseCase } from "../../application/useCases/subscription/getSubscribedPlan.useCase";
import { GetProvidersForChatUseCase } from "../../application/useCases/provider/getProvidersForChat.useCase";
import { AdminRejectProviderUseCase } from "../../application/useCases/provider/adminRejectProvider.useCase";
import { AdminApproveProviderUseCase } from "../../application/useCases/provider/adminApproveProvider.useCase";
import { GetProvidersByFilterUseCase } from "../../application/useCases/provider/getProvidersByFilter.useCase";
import { ProviderGetUserForChatSidebarUseCase } from "../../application/useCases/provider/providerUser.useCase";
import { SubscriptionCheckoutUseCase } from "../../application/useCases/subscription/subscriptionCheckout.useCase";
import { ChangeProviderTrustTagUseCase } from "../../application/useCases/provider/changeProviderTrustTag.useCase";
import { GetServiceAvailabilityUseCase } from "../../application/useCases/serviceAvailability/getServiceAvailability";
import { UserGetProviderDetailsUseCase } from "../../application/useCases/provider/userGetProviderDetails.useCase";
import { AdminGetProviderDetailsUseCase } from "../../application/useCases/provider/adminGetProviderDetails.useCase";
import { ChangeProviderBlockStatusUseCase } from "../../application/useCases/provider/changeProviderBlockStatus.useCase";
import { planRepository, providerProfileRepository, subscriptionRepository, userRepository } from "../../infrastructure/repositoryImpls";
import { bookingQueries, providerServiceQueries, serviceAvailabilityQueries, subscriptionQueries, userQueries } from "../../infrastructure/queriesImpls";
import { ProvideDeleteIdentityProofUseCase, ProvideDeleteServiceProofUseCase, ProviderGetProfileDetailsUseCase, ProviderRequestForApprovalUseCase, ProviderUpdateIdentityProofUseCase, ProviderUpdateServiceProofUseCase } from "../../application/useCases/provider/providerProfile.useCase";


// provider dashboard controller dependency injection
export const getStatsUseCase = new GetStatsUseCase(bookingQueries);
export const getGraphDataUseCase = new GetGraphDataUseCase(bookingQueries, subscriptionMapping);

// provider profile constroller dependency injection
export const providerRequestForApprovalUseCase = new ProviderRequestForApprovalUseCase(providerProfileRepository);
export const providerGetProfileDetailsUseCase = new ProviderGetProfileDetailsUseCase(userQueries);
export const adminGetProviderDetailsUseCase = new AdminGetProviderDetailsUseCase(signedUrlService, userRepository, providerProfileRepository);
export const userGetProviderDetailsUseCase = new UserGetProviderDetailsUseCase(userQueries, signedUrlService);
export const getProviderProofsUseCase = new GetProviderProofsUseCase(signedUrlService, providerProfileRepository);
export const providerUpdateServiceProofUseCase = new ProviderUpdateServiceProofUseCase(providerProfileRepository, signedUrlService);
export const providerUpdateIdentityProofUseCase = new ProviderUpdateIdentityProofUseCase(providerProfileRepository, signedUrlService);
export const provideDeleteServiceProofUseCase = new ProvideDeleteServiceProofUseCase(s3Client, providerProfileRepository, signedUrlService);
export const provideDeleteIdentityProofUseCase = new ProvideDeleteIdentityProofUseCase(s3Client, providerProfileRepository, signedUrlService);

// provider service availability controller dependency injection
export const getServiceAvailabilityUseCase = new GetServiceAvailabilityUseCase(providerProfileRepository, serviceAvailabilityQueries);

// provider subscription controller dependency injection
export const trialSubscriptionUseCase = new TrialSubscriptionUseCase(userRepository, providerProfileRepository, subscriptionRepository, planRepository, kafkaProducer);
export const subscriptionCheckoutUseCase = new SubscriptionCheckoutUseCase(planRepository, userRepository, providerProfileRepository, subscriptionRepository, paymentServiceClient);
export const getSubscribedPlanUseCase = new GetSubscribedPlanUseCase(providerProfileRepository, subscriptionQueries);

// provider user controller dependency injection
export const providerGetUserForChatSidebarUseCase = new ProviderGetUserForChatSidebarUseCase(signedUrlService, bookingQueries);

// provider search controller dependency injection
export const getProvidersByFilterUseCase = new GetProvidersByFilterUseCase(signedUrlService, providerServiceQueries);

// admin provider controller dependency injection
export const adminProviderListUseCase = new AdminProviderListUseCase(userQueries);

// provider chat controller dependency injection
export const getProvidersForChatUseCase = new GetProvidersForChatUseCase(signedUrlService, bookingQueries);

// admin provider action controller dependency injection
export const adminApproveProviderUseCase = new AdminApproveProviderUseCase(userRepository, providerProfileRepository, kafkaProducer);
export const adminRejectProviderUseCase = new AdminRejectProviderUseCase(userRepository, providerProfileRepository, kafkaProducer);
export const changeProviderBlockStatusUseCase = new ChangeProviderBlockStatusUseCase(userRepository, kafkaProducer, cacheService);
export const changeProviderTrustTagUseCase = new ChangeProviderTrustTagUseCase(userRepository, providerProfileRepository, kafkaProducer);