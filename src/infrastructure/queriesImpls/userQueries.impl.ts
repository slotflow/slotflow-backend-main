import { Types } from "mongoose";
import { UserModel } from "../models/user.model";
import { Role } from "../../domain/enums/common.enum";
import { getStartAndEndDate } from "../../shared/utils/dateTime";
import { IUserQueries } from "../../application/queries/IUser.queries";
import { ApiPaginationRequest, CountResult, TableData } from "../../application/dtos/common.dto";
import { GetUsersResponse, GetUserDataRequest, GetUserDataResponse, GetProvidersResponse, GetProviderProfileDetailsResponse } from "../../application/dtos/user.dto";
import { GetProviderDataRequest, GetProviderDataResponse } from "../../application/dtos/admin.dto";

export class UserQueriesImpl implements IUserQueries {

    async findStats(payload: GetUserDataRequest): Promise<GetUserDataResponse> {
        const { startDate, endDate } = getStartAndEndDate(payload.startDate, payload.endDate);
        const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };

        const [totalUsers, blockedUsers] = await Promise.all([
            UserModel.countDocuments(dateFilter),
            UserModel.countDocuments({ isBlocked: true, ...dateFilter }),
        ]);

        return {
            totalUsers,
            blockedUsers,
        };
    };

    async findUsers({ page, limit }: ApiPaginationRequest): Promise<TableData<GetUsersResponse>> {
        const skip = (page - 1) * limit;
        const [users, totalCount] = await Promise.all([
            UserModel.find({}, {
                _id: 1,
                username: 1,
                email: 1,
                isBlocked: 1,
            }).skip(skip).limit(limit).lean<GetUsersResponse>(),
            UserModel.countDocuments(),

        ])
        const totalPages = Math.ceil(totalCount / limit);
        return {
            data: users.map(user => ({
                ...user,
                _id: user._id.toString(),
            })),
            totalPages,
            currentPage: page,
            totalCount
        }
    }

    async findProviders({ page, limit }: ApiPaginationRequest): Promise<TableData<GetProvidersResponse>> {
        const skip = (page - 1) * limit;
        const [providers, totalCountResult] = await Promise.all([
            UserModel.aggregate([
                {
                    $match: {
                        role: Role.PROVIDER,
                    },
                },
                {
                    $lookup: {
                        from: "providerprofiles", // collection name (IMPORTANT: exact Mongo collection name)
                        localField: "_id",
                        foreignField: "userId",
                        as: "profile",
                    },
                },
                {
                    $unwind: {
                        path: "$profile",
                        preserveNullAndEmptyArrays: true, // avoid crash if profile missing
                    },
                },
                {
                    $project: {
                        _id: { $toString: "$_id" },
                        username: 1,
                        email: 1,
                        isBlocked: 1,
                        adminVerificationStatus: "$profile.adminVerificationStatus",
                        isAdminVerified: "$profile.isAdminVerified",
                        trustedBySlotflow: "$profile.trustedBySlotflow",
                    },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limit,
                },
            ]),

            UserModel.aggregate([
                {
                    $match: {
                        role: Role.PROVIDER,
                    },
                },
                {
                    $count: "totalCount",
                },
            ]),
        ]);

        const totalCount = totalCountResult[0]?.totalCount || 0;
        const totalPages = Math.ceil(totalCount / limit);

        return {
            data: providers.map(provider => ({
                ...provider,
                _id: provider._id.toString(),
            })),
            totalPages,
            currentPage: page,
            totalCount,
        };
    }

    async findProviderById(providerId: string): Promise<GetProviderProfileDetailsResponse | null> {
        const result = await UserModel.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(providerId),
                },
            },
            {
                $lookup: {
                    from: "providerprofiles",
                    localField: "_id",
                    foreignField: "userId",
                    as: "profile",
                },
            },
            {
                $unwind: {
                    path: "$profile",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    username: 1,
                    email: 1,
                    isBlocked: 1,
                    phone: 1,
                    createdAt: 1,
                    isAdminVerified: "$profile.isAdminVerified",
                    trustedBySlotflow: "$profile.trustedBySlotflow",
                    adminVerificationStatus: "$profile.adminVerificationStatus",
                    isAddressVerified: "$profile.isAddressVerified",
                    isAvailabilityVerified: "$profile.isAvailabilityVerified",
                    isProofsVerified: "$profile.isProofsVerified",
                    isServiceDetailsVerified: "$profile.isServiceDetailsVerified",
                },
            },
        ]);

        return result[0] || null;
    }

    async findproviderStats(payload: GetProviderDataRequest): Promise<GetProviderDataResponse> {
        const { startDate, endDate } = getStartAndEndDate(
            payload.startDate,
            payload.endDate
        );

        const result = await UserModel.aggregate([
            {
                $match: {
                    role: "PROVIDER",
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $lookup: {
                    from: "providerprofiles",
                    localField: "_id",
                    foreignField: "userId",
                    as: "profile",
                },
            },
            {
                $unwind: {
                    path: "$profile",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $facet: {
                    totalProviders: [{ $count: "count" }],

                    adminVerifiedProviders: [
                        { $match: { "profile.isAdminVerified": true } },
                        { $count: "count" },
                    ],

                    blockedProviders: [
                        { $match: { isBlocked: true } },
                        { $count: "count" },
                    ],

                    addressAddedProviders: [
                        { $match: { addressId: { $ne: null } } },
                        { $count: "count" },
                    ],

                    serviceAddedProviders: [
                        { $match: { "profile.serviceId": { $ne: null } } },
                        { $count: "count" },
                    ],

                    availabilityAddedProviders: [
                        { $match: { "profile.serviceAvailabilityId": { $ne: null } } },
                        { $count: "count" },
                    ],

                    slotflowTrustedProviders: [
                        { $match: { "profile.trustedBySlotflow": true } },
                        { $count: "count" },
                    ],
                },
            },
        ]);

        const stats = result[0];

        const getCount = (arr: CountResult[]) => arr?.[0]?.count || 0;

        return {
            totalProviders: getCount(stats.totalProviders),
            adminVerifiedProviders: getCount(stats.adminVerifiedProviders),
            blockedProviders: getCount(stats.blockedProviders),
            addressAddedProviders: getCount(stats.addressAddedProviders),
            serviceAddedProviders: getCount(stats.serviceAddedProviders),
            availabilityAddedProviders: getCount(stats.availabilityAddedProviders),
            slotflowTrustedProviders: getCount(stats.slotflowTrustedProviders),
        };
    }

}