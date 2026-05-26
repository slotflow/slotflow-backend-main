import { GetUsersOutput } from "../../dtos/user.dto";
import { IUserQueries } from "../../queries/IUser.queries";
import { ApiPaginationInput, TableData } from "../../dtos/common.dto";
import { toAppError } from "../../../shared/error/handleUnknownError";

export class GetUsersUseCase {
    constructor(
        private userQueries: IUserQueries,
    ) { };

    async execute(input: ApiPaginationInput): Promise<TableData<GetUsersOutput>> {
        try {
            return await this.userQueries.findUsers(input);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get users");
        };
    };
};


