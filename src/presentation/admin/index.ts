import { kafkaProducer } from "../../infrastructure/messaging";
import { cacheService, signedUrlService } from "../../infrastructure/services";
import { FetchProviderProofsUseCase } from "../../application/useCases/common/fetchProviderProofs.useCase";
import { AdminChangeUserBlockStatusUseCase, AdminFetchUserDetailsUseCase, AdminUserListUseCase } from "../../application/useCases/admin/adminUser.useCase";
import { AdminChnageServiceBlockStatusUseCase, AdminCreateServiceUseCase, AdminServiceListUseCase } from "../../application/useCases/admin/adminService.useCase";
import { providerRepository, reviewRepository, serviceRepository, userRepository } from "../../infrastructure/repositoryImpls";
import { bookingQueries, paymentQueries, providerQueries, providerServiceQueries, subscriptionQueries, userQueries } from "../../infrastructure/queriesImpls";
import { AdminApproveProviderUseCase, AdminChangeProviderBlockStatusUseCase, AdminChangeProviderTrustTagUseCase, AdminProviderListUseCase, AdminRejectProviderUseCase } from "../../application/useCases/admin/adminProvider.useCase";
import { AdminFetchProviderServiceUseCase } from "../../application/useCases/admin/adminProviderProfile.useCase";
import { FetchTodaysDataUseCase } from "../../application/useCases/admin/dashboard/fetchTodaysData.useCase";
import { FetchUserDataUseCase } from "../../application/useCases/admin/dashboard/fetchUsersData.useCase";
import { FetchProviderDataUseCase } from "../../application/useCases/admin/dashboard/fetchProvidersData.useCase";
import { FetchSubscriptionDataUseCase } from "../../application/useCases/admin/dashboard/fetchSubscriptionData.useCase";
import { FetchRevenueDataUseCase } from "../../application/useCases/admin/dashboard/fetchRevenueData.useCase";
import { FetchBookingsDataUseCase } from "../../application/useCases/admin/dashboard/fetchBookingsData.useCase";
import { FetchGraphDataUseCase } from "../../application/useCases/admin/dashboard/fetchGraphData.useCase";

// admin dashboard controller dependency injection
export const fetchTodaysDataUseCase = new FetchTodaysDataUseCase(userRepository, providerRepository, paymentQueries, bookingQueries);
export const fetchUserDataUseCase = new FetchUserDataUseCase(userQueries);
export const fetchProviderDataUseCase = new FetchProviderDataUseCase(providerQueries);
export const fetchSubscriptionDataUseCase = new FetchSubscriptionDataUseCase(subscriptionQueries);
export const fetchRevenueDataUseCase = new FetchRevenueDataUseCase(paymentQueries);
export const fetchBookingsDataUseCase = new FetchBookingsDataUseCase(bookingQueries);
export const fetchGraphDataUseCase = new FetchGraphDataUseCase();

// admin provider controller dependency injection
export const adminProviderListUseCase = new AdminProviderListUseCase(providerRepository);
export const adminRejectProviderUseCase = new AdminRejectProviderUseCase(providerRepository, kafkaProducer);
export const adminApproveProviderUseCase = new AdminApproveProviderUseCase(providerRepository, kafkaProducer);
export const adminFetchProviderServiceUseCase = new AdminFetchProviderServiceUseCase(providerServiceQueries);
export const fetchProviderProofsUseCase = new FetchProviderProofsUseCase(signedUrlService, providerRepository);
export const adminChangeProviderTrustTagUseCase = new AdminChangeProviderTrustTagUseCase(providerRepository, kafkaProducer);
export const adminChangeProviderBlockStatusUseCase = new AdminChangeProviderBlockStatusUseCase(providerRepository, kafkaProducer, cacheService);

// admin service controller dependency injetion
export const adminServiceListUseCase = new AdminServiceListUseCase(serviceRepository);
export const adminCreateServiceUseCase = new AdminCreateServiceUseCase(serviceRepository);
export const adminChnageServiceBlockStatusUseCase = new AdminChnageServiceBlockStatusUseCase(serviceRepository);

// admin user controller dependency injection
export const adminUserListUseCase = new AdminUserListUseCase(userQueries);
export const adminChangeUserBlockStatusUseCase = new AdminChangeUserBlockStatusUseCase(userRepository, kafkaProducer, cacheService);
export const adminFetchUserDetailsUseCase = new AdminFetchUserDetailsUseCase(userRepository, signedUrlService);
