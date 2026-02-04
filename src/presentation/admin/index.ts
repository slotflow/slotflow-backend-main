import { kafkaProducer } from "../../infrastructure/messaging";
import { cacheService, signedUrlService } from "../../infrastructure/services";
import { FetchAllReviewsUseCase } from "../../application/useCases/common/fetchReviews.useCase";
import { FetchSubscriptionDetailsUseCase } from "../../application/useCases/common/subscription.useCase";
import { AdminUpdateReviewBlockStatusUseCase } from "../../application/useCases/admin/adminReview.useCase";
import { FetchProviderProofsUseCase } from "../../application/useCases/common/fetchProviderProofs.useCase";
import { AdminFetchUserOrProviderAddressUseCase } from "../../application/useCases/admin/adminAddress.useCase";
import { AdminFetchAllSubscriptionsUseCase } from "../../application/useCases/admin/adminSubscription.useCase";
import { AdminFetchAllPaymentsUseCase, AdminFetchRevenueReportUseCase } from "../../application/useCases/admin/adminPayment.useCase";
import { AdminChangePlanBlockStatusUseCase, AdminCreatePlanUseCase, AdminPlanListUseCase } from "../../application/useCases/admin/adminPlan.useCase";
import { AdminChangeUserBlockStatusUseCase, AdminFetchUserDetailsUseCase, AdminUserListUseCase } from "../../application/useCases/admin/adminUser.useCase";
import { AdminChnageServiceBlockStatusUseCase, AdminCreateServiceUseCase, AdminServiceListUseCase } from "../../application/useCases/admin/adminService.useCase";
import { addressRepository, paymentRepository, planRepository, providerRepository, reviewRepository, serviceRepository, userRepository } from "../../infrastructure/repositoryImpls";
import { bookingQueries, paymentQueries, providerQueries, providerServiceQueries, reviewQueries, serviceAvailabilityQueries, subscriptionQueries, userQueries } from "../../infrastructure/queriesImpls";
import { AdminApproveProviderUseCase, AdminChangeProviderBlockStatusUseCase, AdminChangeProviderTrustTagUseCase, AdminProviderListUseCase, AdminRejectProviderUseCase } from "../../application/useCases/admin/adminProvider.useCase";
import { AdminFetchProviderDetailsUseCase, AdminFetchProviderPaymentsUseCase, AdminfetchProviderServiceAvailabilityUseCase, AdminFetchProviderServiceUseCase, AdminFetchProviderSubscriptionsUseCase } from "../../application/useCases/admin/adminProviderProfile.useCase";
import { AdminFetchDashboardAppointmentsStatsDataUseCase, AdminFetchDashboardProviderStatsDataUseCase, AdminFetchDashboardRevenueStatsDataUseCase, AdminFetchDashboardSubscriptionStatsDataUseCase, AdminFetchDashboardTodaysDataUseCase, AdminFetchDashboardUserStatsDataUseCase } from "../../application/useCases/admin/adminDashboard.useCase";

// admin dashboard controller dependency injection
export const adminFetchDashboardUserStatsDataUseCase = new AdminFetchDashboardUserStatsDataUseCase(userQueries);
export const adminFetchDashboardRevenueStatsDataUseCase = new AdminFetchDashboardRevenueStatsDataUseCase(paymentQueries);
export const adminFetchDashboardProviderStatsDataUseCase = new AdminFetchDashboardProviderStatsDataUseCase(providerQueries);
export const adminFetchDashboardAppointmentsStatsDataUseCase = new AdminFetchDashboardAppointmentsStatsDataUseCase(bookingQueries);
export const adminFetchDashboardSubscriptionStatsDataUseCase = new AdminFetchDashboardSubscriptionStatsDataUseCase(subscriptionQueries);
export const adminFetchDashboardTodaysDataUseCase = new AdminFetchDashboardTodaysDataUseCase(userRepository, providerRepository, paymentQueries, bookingQueries);

// admin payment controller dependency injection
export const adminFetchAllPaymentsUseCase = new AdminFetchAllPaymentsUseCase(paymentRepository);
export const adminFetchRevenueReportUseCase = new AdminFetchRevenueReportUseCase(paymentQueries);

// admin plan controller dependency injection
export const adminPlanListUseCase = new AdminPlanListUseCase(planRepository);
export const adminCreatePlanUseCase = new AdminCreatePlanUseCase(planRepository);
export const adminChangePlanBlockStatusUseCase = new AdminChangePlanBlockStatusUseCase(planRepository);

// admin provider controller dependency injection
export const adminProviderListUseCase = new AdminProviderListUseCase(providerRepository);
export const adminFetchProviderPaymentsUseCase = new AdminFetchProviderPaymentsUseCase(paymentRepository);
export const adminRejectProviderUseCase = new AdminRejectProviderUseCase(providerRepository, kafkaProducer);
export const adminApproveProviderUseCase = new AdminApproveProviderUseCase(providerRepository, kafkaProducer);
export const adminFetchProviderServiceUseCase = new AdminFetchProviderServiceUseCase(providerServiceQueries);
export const fetchProviderProofsUseCase = new FetchProviderProofsUseCase(signedUrlService, providerRepository);
export const adminFetchUserOrProviderAddressUseCase = new AdminFetchUserOrProviderAddressUseCase(addressRepository);
export const adminFetchProviderSubscriptionsUseCase = new AdminFetchProviderSubscriptionsUseCase(subscriptionQueries);
export const adminFetchProviderDetailsUseCase = new AdminFetchProviderDetailsUseCase(providerRepository, signedUrlService);
export const adminChangeProviderTrustTagUseCase = new AdminChangeProviderTrustTagUseCase(providerRepository, kafkaProducer);
export const adminChangeProviderBlockStatusUseCase = new AdminChangeProviderBlockStatusUseCase(providerRepository, kafkaProducer, cacheService);
export const adminFetchProviderServiceAvailabilityUseCase = new AdminfetchProviderServiceAvailabilityUseCase(providerRepository, serviceAvailabilityQueries);

// admin review controller dependency injection
export const fetchAllReviewsUseCase = new FetchAllReviewsUseCase(reviewQueries, signedUrlService);
export const adminUpdateReviewBlockStatusUseCase = new AdminUpdateReviewBlockStatusUseCase(reviewRepository);

// admin service controller dependency injetion
export const adminServiceListUseCase = new AdminServiceListUseCase(serviceRepository);
export const adminCreateServiceUseCase = new AdminCreateServiceUseCase(serviceRepository);
export const adminChnageServiceBlockStatusUseCase = new AdminChnageServiceBlockStatusUseCase(serviceRepository);

// admin subscription controller dependency injection
export const fetchSubscriptionDetailsUseCase = new FetchSubscriptionDetailsUseCase(subscriptionQueries);
export const adminFetchAllSubscriptionsUseCase = new AdminFetchAllSubscriptionsUseCase(subscriptionQueries);

// admin user controller dependency injection
export const adminUserListUseCase = new AdminUserListUseCase(userQueries);
export const adminChangeUserBlockStatusUseCase = new AdminChangeUserBlockStatusUseCase(userRepository, kafkaProducer, cacheService);
export const adminFetchUserDetailsUseCase = new AdminFetchUserDetailsUseCase(userRepository, signedUrlService);
