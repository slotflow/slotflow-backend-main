import { log } from "../../../../shared/logger/logger";
import { FetchUserDataResponse } from "../../../dtos/admin.dto";
import { IUserQueries } from "../../../queries/IUser.queries";

export class FetchUserDataUseCase {
    constructor(
        private useQueries: IUserQueries
    ) { };

    async execute(): Promise<FetchUserDataResponse> {
        try {
            return await this.useQueries.fetchStats();
        } catch (error) {
            log.error("FetchUserDataUseCase failed", error as Error);
            throw error;
        };
    };
};