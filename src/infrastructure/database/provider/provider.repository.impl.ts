import dayjs from "dayjs";
import { Types } from "mongoose";
import { IProvider, ProviderModel } from "./provider.model";
import { AdiminFetchAllProviders } from "../../../application/dtos/admin.dto";
import { Provider } from "../../../domain/entities/provider.entity";
import { ProviderUpdateProfileRequest } from "../../../application/dtos/provider.dto";
import { ApiPaginationRequest, ApiResponse } from "../../../application/dtos/common.dto";
import { AdminFetchDashboardProviderStatsDataResponse } from "../../../application/dtos/admin.dto";
import { IProviderRepository } from '../../../domain/interfaces/repositories/IProvider.repository';
import { ProviderMapper } from "../../mappers/provider.mapper";

export class ProviderRepositoryImpl implements IProviderRepository {

    // old methods 

    // private mapToEntity(provider: IProvider): Provider {
    //     return new Provider(
    //         provider._id,
    //         provider.username,
    //         provider.email,
    //         provider.password,
    //         provider.isBlocked,
    //         provider.isEmailVerified,

    //         provider.isAdminVerified,
    //         provider.verificationRejectionReason,

    //         provider.adminVerificationStatus,
    //         provider.isAddressVerified,
    //         provider.isServiceDetailsVerified,
    //         provider.isAvailabilityVerified,
    //         provider.isProofsVerified,

    //         provider.phone,
    //         provider.profileImage,
    //         provider.addressId,
    //         provider.serviceId,
    //         provider.serviceAvailabilityId,
    //         provider.subscription,
    //         provider.verificationToken,
    //         provider.googleConnected,
    //         provider.googleId,
    //         provider.stripeAccountId,
    //         provider.trustedBySlotflow,
    //         provider.identityProof,
    //         provider.serviceProof,
    //         provider.createdAt,
    //         provider.updatedAt,
    //     )
    // }

    // async createProvider(provider: CreateProviderProps): Promise<Provider | null> {
    //     try {
    //         if (!provider) throw new Error("Invalid request.");
    //         const createdProvider = await ProviderModel.create(provider);
    //         return createdProvider ? this.mapToEntity(createdProvider) : null;
    //     } catch (error) {
    //         console.log("createProvider error : ", error);
    //         throw new Error("Failed to create provider");
    //     }
    // }

    // async findProviderByVerificationToken(verificationToken: Provider["verificationToken"]): Promise<Provider | null> {
    //     try {
    //         if (!verificationToken) throw new Error("Invalid request.");
    //         const User = await ProviderModel.findOne({ verificationToken });
    //         return User ? this.mapToEntity(User) : null;
    //     } catch (error) {
    //         console.log("findProviderByVerificationToken error : ", error);
    //         throw new Error("Failed to find provider");
    //     }
    // }

    // async updateProvider(provider: Provider): Promise<Provider | null> {
    //     try {
    //         if (!provider) throw new Error("Invalid request.");
    //         const updatedProvider = await ProviderModel.findByIdAndUpdate(provider._id, provider, { new: true });
    //         return updatedProvider ? this.mapToEntity(updatedProvider) : null;
    //     } catch (error) {
    //         console.log("updateProvider error : ", error);
    //         throw new Error("Failed to update provider");
    //     }
    // }

    // async findProviderByEmail(email: Provider["email"]): Promise<Provider | null> {
    //     try {
    //         if (!email) throw new Error("Invalid request.");
    //         const provider = await ProviderModel.findOne({ email });
    //         return provider ? this.mapToEntity(provider) : null;
    //     } catch (error) {
    //         console.log("findProviderByEmail error : ", error);
    //         throw new Error("Failed to find provider");
    //     }
    // }

    // async findAllProviders({ page, limit }: ApiPaginationRequest): Promise<ApiResponse<AdiminFetchAllProviders>> {
    //     try {
    //         const skip = (page - 1) * limit;
    //         const [providers, totalCount] = await Promise.all([
    //             ProviderModel.find({}, {
    //                 _id: 1,
    //                 username: 1,
    //                 email: 1,
    //                 isBlocked: 1,
    //                 isAdminVerified: 1,
    //                 adminVerificationStatus: 1,
    //                 isEmailVerified: 1,
    //                 trustedBySlotflow: 1
    //             }).skip(skip).limit(limit).lean(),
    //             ProviderModel.countDocuments(),
    //         ]);
    //         const totalPages = Math.ceil(totalCount / limit);
    //         return {
    //             data: providers.map(this.mapToEntity),
    //             totalPages,
    //             currentPage: page,
    //             totalCount
    //         }
    //     } catch (error) {
    //         console.log("findAllProviders error : ", error);
    //         throw new Error("Failed to find all provider");
    //     }
    // }

    // async findProviderById(providerId: Types.ObjectId): Promise<Provider | null> {
    //     try {
    //         const provider = await ProviderModel.findById(providerId)
    //         return provider ? this.mapToEntity(provider) : null;
    //     } catch (error) {
    //         console.log("findProviderById error : ", error);
    //         throw new Error('Failed to find provider');
    //     }
    // }

    // async findProvidersCount(params?: { today: boolean }): Promise<number> {
    //     try {
    //         if (params?.today) {
    //             const startOfDay = dayjs().startOf('day').toDate();
    //             const endOfDay = dayjs().endOf('day').toDate();

    //             return await ProviderModel.countDocuments({
    //                 createdAt: { $gte: startOfDay, $lte: endOfDay }
    //             });
    //         } else {
    //             return await ProviderModel.estimatedDocumentCount();
    //         }
    //     } catch (error) {
    //         console.log("findProvidersCount error : ", error);
    //         throw new Error("Failed to find providers count");
    //     }
    // }

    // async findProvidersStatsForAdminDashboard(): Promise<AdminFetchDashboardProviderStatsDataResponse> {
    //     try {
    //         const providerStatsData = await ProviderModel.aggregate([
    //             {
    //                 $facet: {
    //                     totalProviders: [
    //                         { $count: "count" }
    //                     ],
    //                     emailVerifiedProviders: [
    //                         { $match: { isEmailVerified: true } },
    //                         { $count: "count" }
    //                     ],
    //                     adminVerifiedProviders: [
    //                         { $match: { isAdminVerified: true } },
    //                         { $count: "count" }
    //                     ],
    //                     slotflowTrustedProviders: [
    //                         { $match: { trustedBySlotflow: true } },
    //                         { $count: "count" }
    //                     ],
    //                     blockedProviders: [
    //                         { $match: { isBlocked: true } },
    //                         { $count: "count" }
    //                     ],
    //                     addressAddedProviders: [
    //                         { $match: { addressId: { $exists: true, $ne: null } } },
    //                         { $count: "count" }
    //                     ],
    //                     serviceAddedProviders: [
    //                         { $match: { serviceId: { $exists: true, $ne: null } } },
    //                         { $count: "count" }
    //                     ],
    //                     availabilityAddedProviders: [
    //                         { $match: { serviceAvailabilityId: { $exists: true, $ne: null } } },
    //                         { $count: "count" }
    //                     ],
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     totalProviders: { $ifNull: [{ $arrayElemAt: ["$totalProviders.count", 0] }, 0] },
    //                     emailVerifiedProviders: { $ifNull: [{ $arrayElemAt: ["$emailVerifiedProviders.count", 0] }, 0] },
    //                     adminVerifiedProviders: { $ifNull: [{ $arrayElemAt: ["$adminVerifiedProviders.count", 0] }, 0] },
    //                     blockedProviders: { $ifNull: [{ $arrayElemAt: ["$blockedProviders.count", 0] }, 0] },
    //                     addressAddedProviders: { $ifNull: [{ $arrayElemAt: ["$addressAddedProviders.count", 0] }, 0] },
    //                     serviceAddedProviders: { $ifNull: [{ $arrayElemAt: ["$serviceAddedProviders.count", 0] }, 0] },
    //                     availabilityAddedProviders: { $ifNull: [{ $arrayElemAt: ["$availabilityAddedProviders.count", 0] }, 0] }
    //                 }
    //             }
    //         ]);
    //         return providerStatsData[0];
    //     } catch (error) {
    //         console.log("findProvidersStatsForAdminDashboard error : ", error);
    //         throw new Error("Failed to find provider stats");
    //     }
    // }

    // async findProviderByGoogleId(googleId: string): Promise<Provider | null> {
    //     try {
    //         const provider = await ProviderModel.findOne({ googleId });
    //         return provider ? this.mapToEntity(provider) : null;
    //     } catch (error) {
    //         console.log("findProviderByGoogleId error : ", error);
    //         throw new Error("Failed to find provider");
    //     }
    // }

    // async updateProviderFields(data: ProviderUpdateProfileRequest): Promise<Provider | null> {
    //     try {
    //         const { _id, ...fieldsToUpdate } = data;

    //         const updateObj: Partial<Provider> = {};
    //         Object.keys(fieldsToUpdate).forEach(key => {
    //             const value = fieldsToUpdate[key as keyof typeof fieldsToUpdate];
    //             if (value !== undefined) {
    //                 updateObj[key as keyof Provider] = value as any;
    //             }
    //         });

    //         const updatedProvider = await ProviderModel.findOneAndUpdate(
    //             { _id },
    //             { $set: updateObj },
    //             { new: true }
    //         )
    //         return updatedProvider ? this.mapToEntity(updatedProvider) : null;

    //     } catch (error) {
    //         console.log("updateProviderFields error : ", error);
    //         throw new Error("Failed to update provider");
    //     }
    // }

    // new methods 

    async create(provider: Provider): Promise<Provider> {
        const persistence = ProviderMapper.toPersistence(provider);
        const created = await ProviderModel.create(persistence);
        return ProviderMapper.toDomain(created);
    }

    async update(provider: Provider): Promise<Provider> {
        const persistence = ProviderMapper.toPersistence(provider);

        const updated = await ProviderModel.findByIdAndUpdate(
           new Types.ObjectId(provider._id),
            persistence,
            { new: true }
        );

        if (!updated) {
            throw new Error("Provider not found");
        }

        return ProviderMapper.toDomain(updated);
    }

    async findById(providerId: string): Promise<Provider | null> {
        const doc = await ProviderModel.findById(
            new Types.ObjectId(providerId)
        );

        return doc ? ProviderMapper.toDomain(doc) : null;
    }

    async findByEmail(email: string): Promise<Provider | null> {
        const doc = await ProviderModel.findOne({ email });
        return doc ? ProviderMapper.toDomain(doc) : null;
    }

    async findByGoogleId(googleId: string): Promise<Provider | null> {
        const doc = await ProviderModel.findOne({ googleId });
        return doc ? ProviderMapper.toDomain(doc) : null;
    }

    async findByVerificationToken(token: string): Promise<Provider | null> {
        const doc = await ProviderModel.findOne({ verificationToken: token });
        return doc ? ProviderMapper.toDomain(doc) : null;
    }

    async count(today?: boolean): Promise<number> {
        if (!today) {
            return ProviderModel.countDocuments();
        }

        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        return ProviderModel.countDocuments({
            createdAt: { $gte: start, $lte: end }
        });
    }

}