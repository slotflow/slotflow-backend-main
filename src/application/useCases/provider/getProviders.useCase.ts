import { log } from "../../../shared/logger/logger";
import { GetProvidersOutput } from "../../dtos/user.dto";
import { IUserQueries } from "../../queries/IUser.queries";
import { ApiPaginationInput, TableData } from "../../dtos/common.dto";

export class AdminProviderListUseCase {
    constructor(
        private readonly userQueries: IUserQueries,
    ) { };

    async execute(input: ApiPaginationInput): Promise<TableData<GetProvidersOuput>> {
        try {
            return await this.userQueries.findProviders(input);
        } catch (error) {
            log.error("AdminProviderListUseCase failed", error as Error);
            throw error;
        };
    };
};
