import { log } from "../../../../shared/logger/logger";
import { IUserQueries } from "../../../queries/IUser.queries";
import { FetchUserDataRequest, FetchUserDataResponse } from "../../../dtos/admin.dto";

export class FetchUserDataUseCase {
    constructor(
        private useQueries: IUserQueries
    ) { };

    async execute(payload: FetchUserDataRequest): Promise<FetchUserDataResponse> {
        try {
            return await this.useQueries.fetchStats(payload);
        } catch (error) {
            log.error("FetchUserDataUseCase failed", error as Error);
            throw error;
        };
    };
};