import { log } from "../../../../shared/logger/logger";
import { IUserQueries } from "../../../queries/IUser.queries";
import { GetProviderDataRequest, GetProviderDataResponse } from "../../../dtos/admin.dto";

export class GetProviderDataUseCase {
    constructor(
        private userQueries: IUserQueries
    ) { };

    async execute(payload: GetProviderDataRequest): Promise<GetProviderDataResponse> {
        try {
            return await this.userQueries.findproviderStats(payload);
        } catch (error) {
            log.error("GetProviderDataUseCase failed", error as Error);
            throw error;
        };
    };
};