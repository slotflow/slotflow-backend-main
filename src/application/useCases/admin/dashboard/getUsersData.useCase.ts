import { log } from "../../../../shared/logger/logger";
import { IUserQueries } from "../../../queries/IUser.queries";
import { GetUserDataInput, GetUserDataOutput } from "../../../dtos/user.dto";

export class GetUserDataUseCase {
    constructor(
        private useQueries: IUserQueries
    ) { };

    async execute(inout: GetUserDataInput): Promise<GetUserDataOutput> {
        try {
            return await this.useQueries.findStats(inout);
        } catch (error) {
            log.error("GetUserDataUseCase failed", error as Error);
            throw error;
        };
    };
};