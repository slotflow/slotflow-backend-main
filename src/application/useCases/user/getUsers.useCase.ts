import { log } from "../../../shared/logger/logger";
import { GetUsersResponse } from "../../dtos/user.dto";
import { IUserQueries } from "../../queries/IUser.queries";
import { ApiPaginationRequest, TableData } from "../../dtos/common.dto";

export class GetUsersUseCase {
    constructor(
        private userQueries: IUserQueries,
    ) { };

    async execute(payload: ApiPaginationRequest): Promise<TableData<GetUsersResponse>> {
        try {
            return await this.userQueries.findUsers(payload);
        } catch (error) {
            log.error("GetUsersUseCase failed", error as Error);
            throw error;
        };
    };
};


