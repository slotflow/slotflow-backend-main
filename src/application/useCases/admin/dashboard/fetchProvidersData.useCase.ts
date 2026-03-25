import { log } from "../../../../shared/logger/logger";
import { FetchProviderDataResponse } from "../../../dtos/admin.dto";
import { IProviderQueries } from "../../../queries/IProvider.queries";

export class FetchProviderDataUseCase {
    constructor(
        private providerQuery: IProviderQueries
    ) { };

    async execute(): Promise<FetchProviderDataResponse> {
        try {
            return await this.providerQuery.fetchStats();
        } catch (error) {
            log.error("FetchProviderDataUseCase failed", error as Error);
            throw error;
        };
    };
};