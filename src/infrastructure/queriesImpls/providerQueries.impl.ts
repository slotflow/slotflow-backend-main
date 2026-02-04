import { ProviderModel } from "../models/provider.model";
import { IProviderQueries } from "../../application/queries/IProvider.queries";
import { AdminFetchDashboardProviderStatsDataResponse } from "../../application/dtos/admin.dto";

export class ProviderQueriesImpl implements IProviderQueries {

  async fetchStats(): Promise<AdminFetchDashboardProviderStatsDataResponse> {
    const [
      totalProviders,
      emailVerifiedProviders,
      adminVerifiedProviders,
      blockedProviders,
      addressAddedProviders,
      serviceAddedProviders,
      availabilityAddedProviders,
      slotflowTrustedProviders,
    ] = await Promise.all([
      ProviderModel.countDocuments({}),
      ProviderModel.countDocuments({ isEmailVerified: true }),
      ProviderModel.countDocuments({ isAdminVerified: true }),
      ProviderModel.countDocuments({ isBlocked: true }),
      ProviderModel.countDocuments({ addressId: { $ne: null } }),
      ProviderModel.countDocuments({ serviceId: { $ne: null } }),
      ProviderModel.countDocuments({ serviceAvailabilityId: { $ne: null } }),
      ProviderModel.countDocuments({ trustedBySlotflow: true }),
    ]);

    return {
      totalProviders,
      emailVerifiedProviders,
      adminVerifiedProviders,
      blockedProviders,
      addressAddedProviders,
      serviceAddedProviders,
      availabilityAddedProviders,
      slotflowTrustedProviders,
    };
  };

}
