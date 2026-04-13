import { log } from "../../../../shared/logger/logger";
import { IUserQueries } from "../../../queries/IUser.queries";
import { GetUserDataRequest, GetUserDataResponse } from "../../../dtos/admin.dto";

export class GetUserDataUseCase {
    constructor(
        private useQueries: IUserQueries
    ) { };

    async execute(payload: GetUserDataRequest): Promise<GetUserDataResponse> {
        try {
            return await this.useQueries.findStats(payload);
        } catch (error) {
            log.error("GetUserDataUseCase failed", error as Error);
            throw error;
        };
    };
};