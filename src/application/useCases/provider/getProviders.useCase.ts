import { log } from "../../../shared/logger/logger";
import { IUserQueries } from "../../queries/IUser.queries";
import { GetProvidersResponse } from "../../dtos/user.dto";
import { ApiPaginationRequest, TableData } from "../../dtos/common.dto";

export class AdminProviderListUseCase {
    constructor(
        private readonly userQueries: IUserQueries,
    ) { };

    async execute(payload: ApiPaginationRequest): Promise<TableData<GetProvidersResponse>> {
        try {
            return await this.userQueries.findProviders(payload);
        } catch (error) {
            log.error("AdminProviderListUseCase failed", error as Error);
            throw error;
        };
    };
};
