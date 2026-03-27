import { ProviderModel } from "../models/provider.model";
import { getStartAndEndDate } from "../../shared/utils/dateTime";
import { IProviderQueries } from "../../application/queries/IProvider.queries";
import { FetchProviderDataRequest, FetchProviderDataResponse } from "../../application/dtos/admin.dto";

export class ProviderQueriesImpl implements IProviderQueries {

  async fetchStats(payload: FetchProviderDataRequest): Promise<FetchProviderDataResponse> {
    const { startDate, endDate } = getStartAndEndDate(payload.startDate, payload.endDate);
    const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };
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
      ProviderModel.countDocuments(dateFilter),
      ProviderModel.countDocuments({ isEmailVerified: true, ...dateFilter }),
      ProviderModel.countDocuments({ isAdminVerified: true, ...dateFilter }),
      ProviderModel.countDocuments({ isBlocked: true, ...dateFilter }),
      ProviderModel.countDocuments({ addressId: { $ne: null }, ...dateFilter }),
      ProviderModel.countDocuments({ serviceId: { $ne: null }, ...dateFilter }),
      ProviderModel.countDocuments({ serviceAvailabilityId: { $ne: null }, ...dateFilter }),
      ProviderModel.countDocuments({ trustedBySlotflow: true, ...dateFilter }),
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
