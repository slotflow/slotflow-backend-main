import { ProviderModel } from "../models/provider.model";
import { FetchProviderDataResponse } from "../../application/dtos/admin.dto";
import { IProviderQueries } from "../../application/queries/IProvider.queries";

export class ProviderQueriesImpl implements IProviderQueries {

  async fetchStats(): Promise<FetchProviderDataResponse> {
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
