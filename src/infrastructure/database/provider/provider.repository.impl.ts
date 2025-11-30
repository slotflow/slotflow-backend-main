import dayjs from "dayjs";
import { Types } from "mongoose";
import { IProvider, ProviderModel } from "./provider.model";
import { AdiminFetchAllProviders } from "../../dtos/admin.dto";
import { Provider } from "../../../domain/entities/provider.entity";
import { ApiPaginationRequest, ApiResponse } from "../../dtos/common.dto";
import { AdminFetchDashboardProviderStatsDataResponse } from "../../dtos/admin.dto";
import {  CreateProviderProps, IProviderRepository } from '../../../domain/repositories/IProvider.repository';

export class ProviderRepositoryImpl implements IProviderRepository {
    private mapToEntity(provider: IProvider): Provider {
        return new Provider(
            provider._id,
            provider.username,
            provider.email,
            provider.password,
            provider.isBlocked,
            provider.isEmailVerified,
            provider.isAdminVerified,
            provider.phone,
            provider.profileImage,
            provider.addressId,
            provider.serviceId,
            provider.serviceAvailabilityId,
            provider.subscription,
            provider.verificationToken,
            provider.googleConnected,
            provider.googleId,
            provider.stripeAccountId,
            provider.trustedBySlotflow,
            provider.createdAt,
            provider.updatedAt,
        )
    }

    async createProvider(provider: CreateProviderProps): Promise<Provider | null> {
        try {
            if (!provider) throw new Error("Invalid request.");
            const createdProvider = await ProviderModel.create(provider);
            return createdProvider ? this.mapToEntity(createdProvider) : null;
        } catch (error) {
            console.log("createProvider error : ",error);
            throw new Error("Failed to create provider");
        }
    }

    async findProviderByVerificationToken(verificationToken: Provider["verificationToken"]): Promise<Provider | null> {
        try {
            if (!verificationToken) throw new Error("Invalid request.");
            const User = await ProviderModel.findOne({ verificationToken });
            return User || null;
        } catch (error) {
            console.log("findProviderByVerificationToken error : ",error);
            throw new Error("Failed to find provider");
        }
    }

    async updateProvider(provider: Provider): Promise<Provider | null> {
        try {
            if (!provider) throw new Error("Invalid request.");
            const updatedProvider = await ProviderModel.findByIdAndUpdate(provider._id, provider, { new: true });
            return updatedProvider ? this.mapToEntity(updatedProvider) : null;
        } catch (error) {
            console.log("updateProvider error : ",error);
            throw new Error("Failed to update provider");
        }
    }

    async findProviderByEmail(email: Provider["email"]): Promise<Provider | null> {
        try {
            if (!email) throw new Error("Invalid request.");
            const provider = await ProviderModel.findOne({ email });
            return provider ? this.mapToEntity(provider) : null;
        } catch (error) {
            console.log("findProviderByEmail error : ",error);
            throw new Error("Failed to find provider");
        }
    }

    async findAllProviders({ page, limit }: ApiPaginationRequest): Promise<ApiResponse<AdiminFetchAllProviders>> {
        try {
            const skip = (page - 1) * limit;
            const [providers, totalCount] = await Promise.all([
                ProviderModel.find({}, {
                    _id: 1,
                    username: 1,
                    email: 1,
                    isBlocked: 1,
                    isAdminVerified: 1,
                    isEmailVerified: 1,
                    trustedBySlotflow: 1
                }).skip(skip).limit(limit).lean(),
                ProviderModel.countDocuments(),
            ]);
            const totalPages = Math.ceil(totalCount / limit);
            return {
                data: providers.map(this.mapToEntity),
                totalPages,
                currentPage: page,
                totalCount
            }
        } catch (error) {
            console.log("findAllProviders error : ",error);
            throw new Error("Failed to find all provider");
        }
    }

    async findProviderById(providerId: Types.ObjectId): Promise<Provider | null> {
        try {
            const provider = await ProviderModel.findById(providerId)
            return provider ? this.mapToEntity(provider) : null;
        } catch (error) {
            console.log("findProviderById error : ",error);
            throw new Error('Failed to find provider');
        }
    }

    async findProvidersCount(params?: { today: boolean }): Promise<number> {
        try {
            if (params?.today) {
                const startOfDay = dayjs().startOf('day').toDate();
                const endOfDay = dayjs().endOf('day').toDate();

                return await ProviderModel.countDocuments({
                    createdAt: { $gte: startOfDay, $lte: endOfDay }
                });
            } else {
                return await ProviderModel.estimatedDocumentCount();
            }
        } catch (error) {
            console.log("findProvidersCount error : ",error);
            throw new Error("Failed to find providers count");
        }
    }

    async findProvidersStatsForAdminDashboard(): Promise<AdminFetchDashboardProviderStatsDataResponse> {
        try {
            const providerStatsData = await ProviderModel.aggregate([
                {
                    $facet: {
                        totalProviders: [
                            { $count: "count" }
                        ],
                        emailVerifiedProviders: [
                            { $match: { isEmailVerified: true } },
                            { $count: "count" }
                        ],
                        adminVerifiedProviders: [
                            { $match: { isAdminVerified: true } },
                            { $count: "count" }
                        ],
                        slotflowTrustedProviders: [
                            { $match: { trustedBySlotflow: true } },
                            { $count: "count" }
                        ],
                        blockedProviders: [
                            { $match: { isBlocked: true } },
                            { $count: "count" }
                        ],
                        addressAddedProviders: [
                            { $match: { addressId: { $exists: true, $ne: null } } }, 
                            { $count: "count" }
                        ],
                        serviceAddedProviders: [
                            { $match: { serviceId: { $exists: true, $ne: null } } }, 
                            { $count: "count" }
                        ],
                        availabilityAddedProviders: [
                            { $match: { serviceAvailabilityId: { $exists: true, $ne: null } } },
                            { $count: "count" }
                        ],
                    }
                },
                {
                    $project: {
                        totalProviders: { $ifNull: [{ $arrayElemAt: ["$totalProviders.count", 0] }, 0] },
                        emailVerifiedProviders: { $ifNull: [{ $arrayElemAt: ["$emailVerifiedProviders.count", 0] }, 0] },
                        adminVerifiedProviders: { $ifNull: [{ $arrayElemAt: ["$adminVerifiedProviders.count", 0] }, 0] },
                        blockedProviders: { $ifNull: [{ $arrayElemAt: ["$blockedProviders.count", 0] }, 0] },
                        addressAddedProviders: { $ifNull: [{ $arrayElemAt: ["$addressAddedProviders.count", 0] }, 0] },
                        serviceAddedProviders: { $ifNull: [{ $arrayElemAt: ["$serviceAddedProviders.count", 0] }, 0] },
                        availabilityAddedProviders: { $ifNull: [{ $arrayElemAt: ["$availabilityAddedProviders.count", 0] }, 0] }
                    }
                }
            ]);
            return providerStatsData[0];
        } catch (error) {
            console.log("findProvidersStatsForAdminDashboard error : ",error);
            throw new Error("Failed to find provider stats");
        }
    }

    async findProviderByGoogleId(googleId: string): Promise<Provider | null> {
        try {
            const provider = await ProviderModel.findOne({googleId});
            return provider ? this.mapToEntity(provider) : null;
        } catch (error) {
            console.log("findProviderByGoogleId error : ",error);
            throw new Error("Failed to find provider");
        }
    }
    
}