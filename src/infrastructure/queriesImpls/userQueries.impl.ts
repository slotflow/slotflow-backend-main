import { UserModel } from "../models/user.model";
import { getStartAndEndDate } from "../../shared/utils/dateTime";
import { GetUsersResponse } from "../../application/dtos/user.dto";
import { IUserQueries } from "../../application/queries/IUser.queries";
import { ApiPaginationRequest, TableData } from "../../application/dtos/common.dto";
import { FetchUserDataRequest, FetchUserDataResponse } from "../../application/dtos/admin.dto";

export class UserQueriesImpl implements IUserQueries {

    async fetchStats(payload: FetchUserDataRequest): Promise<FetchUserDataResponse> {
        const { startDate, endDate } = getStartAndEndDate(payload.startDate, payload.endDate);
        const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };

        const [totalUsers, emailVerifiedUsers, blockedUsers] = await Promise.all([
            UserModel.countDocuments(dateFilter),
            UserModel.countDocuments({ isEmailVerified: true, ...dateFilter }),
            UserModel.countDocuments({ isBlocked: true, ...dateFilter }),
        ]);

        return {
            totalUsers,
            emailVerifiedUsers,
            blockedUsers,
        };
    };

    async findAll({ page, limit }: ApiPaginationRequest): Promise<TableData<GetUsersResponse>> {
        const skip = (page - 1) * limit;
        const [users, totalCount] = await Promise.all([
            UserModel.find({}, {
                _id: 1,
                username: 1,
                email: 1,
                isBlocked: 1,
                isEmailVerified: 1
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

}