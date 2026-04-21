import { GetProvidersOutput } from "../../dtos/user.dto";
import { IUserQueries } from "../../queries/IUser.queries";
import { ApiPaginationInput, TableData } from "../../dtos/common.dto";
import { toAppError } from "../../../shared/error/handleUnknownError";

export class AdminProviderListUseCase {
    constructor(
        private readonly userQueries: IUserQueries,
    ) { };

    async execute(input: ApiPaginationInput): Promise<TableData<GetProvidersOutput>> {
        try {
            return await this.userQueries.findProviders(input);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to find providers");
        };
    };
};
