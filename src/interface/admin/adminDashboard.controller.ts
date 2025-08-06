import { Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { AdminFetchDashboardProviderStatsDataUseCase, AdminFetchDashboardTodaysDataUseCase, AdminFetchDashboardUserStatsDataUseCase } from "../../application/admin-use.case/adminDashboard.use-case";

const userRepositoryImpl = new UserRepositoryImpl();
const providerRepositoryImpl = new ProviderRepositoryImpl();
const paymentRepositoryImpl = new PaymentRepositoryImpl();
const bookingRepositoryImpl = new BookingRepositoryImpl();
const adminFetchDashboardUserStatsDataUseCase = new AdminFetchDashboardUserStatsDataUseCase(userRepositoryImpl);
const adminFetchDashboardTodaysDataUseCase = new AdminFetchDashboardTodaysDataUseCase(userRepositoryImpl, providerRepositoryImpl, paymentRepositoryImpl, bookingRepositoryImpl);
const adminFetchDashboardProviderStatsDataUseCase = new AdminFetchDashboardProviderStatsDataUseCase( providerRepositoryImpl );

export class AdminDashboardController {
    constructor(
        private adminFetchDashboardTodaysDataUseCase: AdminFetchDashboardTodaysDataUseCase,
        private adminFetchDashboardUserStatsDataUseCase: AdminFetchDashboardUserStatsDataUseCase,
        private adminFetchDashboardProviderStatsDataUseCase: AdminFetchDashboardProviderStatsDataUseCase,
    ) {
        this.fetchTodaysData = this.fetchTodaysData.bind(this);
        this.fetchUserStats = this.fetchUserStats.bind(this);
        this.fetchProviderStats = this.fetchProviderStats.bind(this);
    }

    async fetchTodaysData(req: Request, res: Response) {
        try {
            const result = await this.adminFetchDashboardTodaysDataUseCase.execute();
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async fetchUserStats(req: Request, res: Response) {
        try {
            const result = await this.adminFetchDashboardUserStatsDataUseCase.execute();
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async fetchProviderStats(req: Request, res: Response) {
        try {
            const result = await this.adminFetchDashboardProviderStatsDataUseCase.execute();
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

}

const adminDashboardController = new AdminDashboardController(adminFetchDashboardTodaysDataUseCase, adminFetchDashboardUserStatsDataUseCase, adminFetchDashboardProviderStatsDataUseCase );
export { adminDashboardController }