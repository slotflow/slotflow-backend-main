import { IUserQueries } from "../../../../interfaces/queries/IUser.queries";
import { toAppError } from "../../../../../shared/error/handleUnknownError";
import { GetUserStatsDataInput, GetUserStatsDataOutput } from "../../../../dtos/admin.dto";

export class GetUserStatsDataUseCase {
    constructor(
        private useQueries: IUserQueries
    ) { };

    async execute(input: GetUserStatsDataInput): Promise<GetUserStatsDataOutput> {
        try {
            return await this.useQueries.findStats(input);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to fetch user stats data");
        };
    };
};