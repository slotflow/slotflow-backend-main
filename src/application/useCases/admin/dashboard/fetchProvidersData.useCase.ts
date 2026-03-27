import { log } from "../../../../shared/logger/logger";
import { IProviderQueries } from "../../../queries/IProvider.queries";
import { FetchProviderDataRequest, FetchProviderDataResponse } from "../../../dtos/admin.dto";

export class FetchProviderDataUseCase {
    constructor(
        private providerQuery: IProviderQueries
    ) { };

    async execute(payload: FetchProviderDataRequest): Promise<FetchProviderDataResponse> {
        try {
            return await this.providerQuery.fetchStats(payload);
        } catch (error) {
            log.error("FetchProviderDataUseCase failed", error as Error);
            throw error;
        };
    };
};