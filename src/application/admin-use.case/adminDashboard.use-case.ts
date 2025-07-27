import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { AdminFetchDashboardUserStatsDataResponse } from "../../infrastructure/dtos/admin.dto";

export class AdminFetchDashboardUserStatsDataUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
    ) { }

    async execute() : Promise<ApiResponse<AdminFetchDashboardUserStatsDataResponse>> {
        try {

            const dashboardUserStatsData = await this.userRepositoryImpl.findUsersStatsData();
            return { success: true, message: "Fetched successfully", data: dashboardUserStatsData };

        } catch (error) {
            console.log("Admin dashboard user stats fetching usecase error : ",error);
            throw new Error("Admin dashboard user stats fetching error");
        }
    }
}