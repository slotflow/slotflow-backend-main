import { Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { AdminFetchDashboardUserStatsDataUseCase } from "../../application/admin-use.case/adminDashboard.use-case";

const userRepositoryImpl = new UserRepositoryImpl();
const adminFetchDashboardUserStatsDataUseCase = new AdminFetchDashboardUserStatsDataUseCase( userRepositoryImpl );

export class AdminDashboardController {
    constructor(
        private adminFetchDashboardUserStatsDataUseCase: AdminFetchDashboardUserStatsDataUseCase,
    ) {
        this.fetchUserStats = this.fetchUserStats.bind(this);
    }

    async fetchUserStats(req: Request, res: Response) {
        try {
            const result = await this.adminFetchDashboardUserStatsDataUseCase.execute();
            res.status(200).json(result);
        }catch(error) {
            HandleError.handle(error, res);
        }
    }
}

const adminDashboardController = new AdminDashboardController( adminFetchDashboardUserStatsDataUseCase );
export { adminDashboardController }