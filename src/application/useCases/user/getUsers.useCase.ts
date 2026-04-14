import { log } from "../../../shared/logger/logger";
import { GetUsersOutput } from "../../dtos/user.dto";
import { IUserQueries } from "../../queries/IUser.queries";
import { ApiPaginationInput, TableData } from "../../dtos/common.dto";

export class GetUsersUseCase {
    constructor(
        private userQueries: IUserQueries,
    ) { };

    async execute(input: ApiPaginationInput): Promise<TableData<GetUsersOutput>> {
        try {
            return await this.userQueries.findUsers(input);
        } catch (error) {
            log.error("GetUsersUseCase failed", error as Error);
            throw error;
        };
    };
};


