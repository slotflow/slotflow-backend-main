import dayjs from "dayjs";
import { Types } from "mongoose";
import { IUser, UserModel } from "./user.model";
import { AdminFetchAllUsers } from "../../../application/dtos/admin.dto";
import { User } from "../../../domain/entities/user.entity";
import { ApiPaginationRequest, ApiResponse } from "../../../application/dtos/common.dto";
import { AdminFetchDashboardUserStatsDataResponse } from "../../../application/dtos/admin.dto";
import { CreateUserProps, IUserRepository, UpdateUserFileds } from "../../../domain/interfaces/repositories/IUser.repository";

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
            user.googleConnected,
            user.googleId,
            user.createdAt,
            user.updatedAt,
        );
    }

    async createUser(user: CreateUserProps): Promise<User> {
        try {
            const createdUser = await UserModel.create(user);
            return this.mapToEntity(createdUser);
        } catch (error) {
            console.log("createUser error : ", error);
            throw new Error("Failed to create user");
        }
    }

    async findUserByVerificationToken(verificationToken: string): Promise<User | null> {
        try {
            const user = await UserModel.findOne({ verificationToken });
            return user ? this.mapToEntity(user) : null;
        } catch (error) {
            console.log("findUserByVerificationToken error : ", error);
            throw new Error("Failed to find user");
        }
    }

    async updateUser(user: User): Promise<User | null> {
        try {
            const updatedUser = await UserModel.findByIdAndUpdate(user._id, user, { new: true });
            return updatedUser ? this.mapToEntity(updatedUser) : null;
        } catch (error) {
            console.log("updateUser error : ", error);
            throw new Error("Failed to find user");
        }
    }

    async findUserByEmail(email: string): Promise<User | null> {
        try {
            const user = await UserModel.findOne({ email });
            return user ? this.mapToEntity(user) : null;
        } catch (error) {
            console.log("findUserByEmail error : ", error);
            throw new Error("Failed to find user");
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
            console.log("findAllUsers error : ", error);
            throw new Error("Failed to find all users")
        }
    }

    async findUserById(userId: Types.ObjectId): Promise<User | null> {
        try {
            const user = await UserModel.findById(userId);
            return user ? this.mapToEntity(user) : null;
        } catch (error) {
            console.log("findUserById error : ", error);
            throw new Error("Failed to find user");
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
            console.log("findUsersStatsData error : ", error);
            throw new Error("Failed to find user stats");
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
            console.log("findUsersCount error : ", error);
            throw new Error("Failed to find users count");
        }
    }

    async findUserByGoogleId(googleId: string): Promise<User | null> {
        try {
            const user = await UserModel.findOne({ googleId });
            return user ? this.mapToEntity(user) : null;
        } catch (error) {
            console.log("findUserByGoogleId error : ", error);
            throw new Error("Failed to find user");
        }
    }

    async updateUserFields(data: UpdateUserFileds): Promise<User | null> {
        try {
            const { _id, ...fieldsToUpdate } = data;

            const updateObj: Partial<User> = {};
            Object.keys(fieldsToUpdate).forEach(key => {
                const value = fieldsToUpdate[key as keyof typeof fieldsToUpdate];
                if (value !== undefined) {
                    updateObj[key as keyof User] = value as any;
                }
            });

            const updatedUser = await UserModel.findOneAndUpdate(
                { _id },
                { $set: updateObj },
                { new: true }
            )
            return updatedUser || null;

        } catch (error) {
            console.log("findUserByGoogleId error : ", error);
            throw new Error("Failed to update user");
        }
    }
}
