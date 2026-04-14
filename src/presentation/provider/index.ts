import { kafkaProducer } from "../../infrastructure/messaging";
import { s3Client } from "../../infrastructure/cloud/aws/aws_s3";
import { subscriptionMapping } from "../../infrastructure/helpers";
import { paymentServiceClient } from "../../infrastructure/clients";
import { cacheService, signedUrlService } from "../../infrastructure/services";
import { AdminProviderListUseCase } from "../../application/useCases/provider/getProviders.useCase";
import { GetProviderStatsUseCase } from "../../application/useCases/provider/dashboard/getStats.useCase";
import { GetProviderProofsUseCase } from "../../application/useCases/common/getProviderProofs.useCase";
import { TrialSubscriptionUseCase } from "../../application/useCases/subscription/trailSubscription.useCase";
import { GetProviderGraphDataUseCase } from "../../application/useCases/provider/dashboard/getGraphData.useCase";
import { GetSubscribedPlanUseCase } from "../../application/useCases/subscription/getSubscribedPlan.useCase";
import { AdminRejectProviderUseCase } from "../../application/useCases/provider/adminRejectProvider.useCase";
import { AdminApproveProviderUseCase } from "../../application/useCases/provider/adminApproveProvider.useCase";
import { SubscriptionCheckoutUseCase } from "../../application/useCases/subscription/subscriptionCheckout.useCase";
import { ChangeProviderTrustTagUseCase } from "../../application/useCases/provider/changeProviderTrustTag.useCase";
import { GetServiceAvailabilityUseCase } from "../../application/useCases/serviceAvailability/getServiceAvailability";
import { UserGetProviderDetailsUseCase } from "../../application/useCases/provider/userGetProviderDetails.useCase";
import { AdminGetProviderDetailsUseCase } from "../../application/useCases/provider/adminGetProviderDetails.useCase";
import { ChangeProviderBlockStatusUseCase } from "../../application/useCases/provider/changeProviderBlockStatus.useCase";
import { planRepository, providerProfileRepository, subscriptionRepository, userRepository } from "../../infrastructure/repositoryImpls";
import { bookingQueries, serviceAvailabilityQueries, subscriptionQueries, userQueries } from "../../infrastructure/queriesImpls";
import { ProvideDeleteIdentityProofUseCase, ProvideDeleteServiceProofUseCase, ProviderGetProfileDetailsUseCase, ProviderRequestForApprovalUseCase, ProviderUpdateIdentityProofUseCase, ProviderUpdateServiceProofUseCase } from "../../application/useCases/provider/providerProfile.useCase";


// provider dashboard controller dependency injection
export const getProviderStatsUseCase = new GetProviderStatsUseCase(bookingQueries);
export const getProviderGraphDataUseCase = new GetProviderGraphDataUseCase(bookingQueries, subscriptionMapping);

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

// admin provider controller dependency injection
export const adminProviderListUseCase = new AdminProviderListUseCase(userQueries);

// admin provider action controller dependency injection
export const adminApproveProviderUseCase = new AdminApproveProviderUseCase(userRepository, providerProfileRepository, kafkaProducer);
export const adminRejectProviderUseCase = new AdminRejectProviderUseCase(userRepository, providerProfileRepository, kafkaProducer);
export const changeProviderBlockStatusUseCase = new ChangeProviderBlockStatusUseCase(userRepository, kafkaProducer, cacheService);
export const changeProviderTrustTagUseCase = new ChangeProviderTrustTagUseCase(userRepository, providerProfileRepository, kafkaProducer);