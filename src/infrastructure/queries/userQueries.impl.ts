import { UserModel } from "../database/user.model";
import { IUserQueries } from "../../application/queries/IUser.queries";
import { ApiPaginationRequest, TableData } from "../../application/dtos/common.dto";
import { AdminFetchAllUsers, AdminFetchDashboardUserStatsDataResponse } from "../../application/dtos/admin.dto";

export class UserQueriesImpl implements IUserQueries {

    async fetchStats(): Promise<AdminFetchDashboardUserStatsDataResponse> {
        const [
            totalUsers,
            emailVerifiedUsers,
            blockedUsers,
        ] = await Promise.all([
            UserModel.countDocuments({}),
            UserModel.countDocuments({ isEmailVerified: true }),
            UserModel.countDocuments({ isBlocked: true }),
        ]);

        return {
            totalUsers,
            emailVerifiedUsers,
            blockedUsers,
        };
    };

    async findAll({ page, limit }: ApiPaginationRequest): Promise<TableData<AdminFetchAllUsers>> {
        const skip = (page - 1) * limit;
        const [users, totalCount] = await Promise.all([
            UserModel.find({}, {
                _id: 1,
                username: 1,
                email: 1,
                isBlocked: 1,
                isEmailVerified: 1
            }).skip(skip).limit(limit).lean<AdminFetchAllUsers>(),
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

}