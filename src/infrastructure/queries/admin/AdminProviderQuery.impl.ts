import { ProviderMapper } from "../../mappers/provider.mapper";
import { ProviderModel } from "../../database/provider/provider.model";
import { AdiminFetchAllProviders } from "../../../application/dtos/admin.dto";
import { ApiPaginationRequest, TableData } from "../../../application/dtos/common.dto";
import { IAdminProviderQuery } from "../../../application/queries/admin/IAdminProviderQuery";

export class AdminProviderQueryImpl implements IAdminProviderQuery {

  async fetchStats() {
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
  }

  async findAll({ page, limit }: ApiPaginationRequest): Promise<TableData<AdiminFetchAllProviders>> {
    const skip = (page - 1) * limit;
    const [providers, totalCount] = await Promise.all([
      ProviderModel.find({}, {
        _id: 1,
        username: 1,
        email: 1,
        isBlocked: 1,
        isAdminVerified: 1,
        adminVerificationStatus: 1,
        isEmailVerified: 1,
        trustedBySlotflow: 1
      }).skip(skip).limit(limit).lean(),
      ProviderModel.countDocuments(),
    ]);
    const totalPages = Math.ceil(totalCount / limit);
    return {
      data: providers.map((provider) => ProviderMapper.toDomain(provider)),
      totalPages,
      currentPage: page,
      totalCount
    }
  }
}
