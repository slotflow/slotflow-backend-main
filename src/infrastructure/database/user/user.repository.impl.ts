import { Types } from "mongoose";
import { IUser, UserModel } from "./user.model";
import { User } from "../../../domain/entities/user.entity";
import { CreateUserProps, IUserRepository } from "../../../domain/repositories/IUser.repository";
import { AdminFetchAllUsers, AdminFetchDashboardUserStatsDataResponse } from "../../dtos/admin.dto";
import { ApiPaginationRequest, ApiResponse } from "../../dtos/common.dto";
import dayjs from "dayjs";

export class UserRepositoryImpl implements IUserRepository {
    private mapToEntity(user: IUser): User {
        return new User(
            user._id,
            user.username,
            user.email,
            user.password,
            user.isBlocked,
            user.isEmailVerified,
            user.phone,
            user.profileImage,
            user.addressId,
            user.bookingsId,
            user.verificationToken,
            user.createdAt,
            user.updatedAt,
        );
    }

    async createUser(user: CreateUserProps): Promise<User> {
        try {
            const createdUser = await UserModel.create(user);
            return this.mapToEntity(createdUser);
        } catch (error) {
            throw new Error("Unable to register, please try again after a few minutes.");
        }
    }

    async verifyUser(verificationToken: string): Promise<User | null> {
        try {
            const user = await UserModel.findOne({ verificationToken });
            return user ? this.mapToEntity(user) : null;
        } catch (error) {
            throw new Error("Unable to retrieve verification data.");
        }
    }

    async updateUser(user: User): Promise<User | null> {
        try {
            const updatedUser = await UserModel.findByIdAndUpdate(user._id, user, { new: true });
            return updatedUser ? this.mapToEntity(updatedUser) : null;
        } catch (error) {
            throw new Error("Unable to update user.");
        }
    }

    async findUserByEmail(email: string): Promise<User | null> {
        try {
            const user = await UserModel.findOne({ email });
            return user ? this.mapToEntity(user) : null;
        } catch (error) {
            throw new Error("Unable to find user by email.");
        }
    }

    async findAllUsers({ page, limit }: ApiPaginationRequest): Promise<ApiResponse<AdminFetchAllUsers>> {
        try {
            const skip = (page - 1) * limit;
            const [users, totalCount] = await Promise.all([
                UserModel.find({}, {
                    _id: 1,
                    username: 1,
                    email: 1,
                    isBlocked: 1,
                    isEmailVerified: 1
                }).skip(skip).limit(limit).lean(),
                UserModel.countDocuments(),

            ])
            const totalPages = Math.ceil(totalCount / limit);
            return {
                data: users.map(this.mapToEntity),
                totalPages,
                currentPage: page,
                totalCount
            }
        } catch (error) {
            throw new Error("Failed to fetch users from database.")
        }
    }

    async findUserById(userId: Types.ObjectId): Promise<User | null> {
        try {
            const user = await UserModel.findById(userId);
            return user ? this.mapToEntity(user) : null;
        } catch (error) {
            throw new Error("User not found.");
        }
    }

    async findUsersStatsData(): Promise<AdminFetchDashboardUserStatsDataResponse> {
        try {
            const userStatsData = await UserModel.aggregate([
                {
                    $facet: {
                        totalUsers: [
                            { $count: "count" }
                        ],
                        emailVerifiedUsers: [
                            { $match: { isEmailVerified: true } },
                            { $count: "count" }
                        ],
                        blockedUsers: [
                            { $match: { isBlocked: true } },
                            { $count: "count" }
                        ]
                    }
                },
                {
                    $project: {
                        totalUsers: { $ifNull: [{ $arrayElemAt: ["$totalUsers.count", 0] }, 0] },
                        emailVerifiedUsers: { $ifNull: [{ $arrayElemAt: ["$emailVerifiedUsers.count", 0] }, 0] },
                        blockedUsers: { $ifNull: [{ $arrayElemAt: ["$blockedUsers.count", 0] }, 0] }
                    }
                }
            ]);
            return userStatsData[0];
        } catch (error) {
            throw new Error("User stats data fetching failed");
        }
    }

    async findUsersCount(params?: { today: boolean }): Promise<number> {
        try {
            if (params?.today) {
                const startOfDay = dayjs().startOf('day').toDate();
                const endOfDay = dayjs().endOf('day').toDate();

                return await UserModel.countDocuments({
                    createdAt: { $gte: startOfDay, $lte: endOfDay }
                });
            } else {
                return await UserModel.estimatedDocumentCount();
            }
        } catch (error) {
            throw new Error("Users count fetching failed");
        }
    }
}
