import { bookingQueries, subscriptionQueries, userQueries } from "../../infrastructure/queries";
import { GetUserStatsDataUseCase } from "../../application/useCases/admin/dashboard/stats/getUsersStatsData.useCase";
import { GetAdminBookingsChartDataUseCase } from "../../application/useCases/admin/dashboard/chartData/getBookingsChartData.useCase";
import { GetBookingsStatsDataUseCase } from "../../application/useCases/admin/dashboard/stats/getBookingsStatsData.useCase";
import { GetProviderStatsDataUseCase } from "../../application/useCases/admin/dashboard/stats/getProvidersStatsData.useCase";
import { GetSubscriptionStatsDataUseCase } from "../../application/useCases/admin/dashboard/stats/getSubscriptionStatsData.useCase";
import { GetRoleBasedChartDataUseCase } from "../../application/useCases/admin/dashboard/chartData/getRoleBasedChartData.useCase";
import { GetSubscriptionsChartDataUseCase } from "../../application/useCases/admin/dashboard/chartData/getSubscriptionsChartData.useCase";

export const getUserStatsDataUseCase = new GetUserStatsDataUseCase(userQueries);

export const getProviderStatsDataUseCase = new GetProviderStatsDataUseCase(userQueries);

export const getSubscriptionStatsDataUseCase = new GetSubscriptionStatsDataUseCase(
  subscriptionQueries,
);

export const getBookingsStatsDataUseCase = new GetBookingsStatsDataUseCase(bookingQueries);

export const getAdminBookingsChartDataUseCase = new GetAdminBookingsChartDataUseCase(
  bookingQueries,
);

export const getRoleBasedChartDataUseCase = new GetRoleBasedChartDataUseCase(userQueries);

export const getSubscriptionsChartDataUseCase = new GetSubscriptionsChartDataUseCase(
  subscriptionQueries,
);
