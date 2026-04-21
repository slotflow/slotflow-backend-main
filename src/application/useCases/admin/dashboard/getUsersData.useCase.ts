import { IUserQueries } from "../../../queries/IUser.queries";
import { toAppError } from "../../../../shared/error/handleUnknownError";
import { GetUserDataInput, GetUserDataOutput } from "../../../dtos/user.dto";

export class GetUserDataUseCase {
    constructor(
        private useQueries: IUserQueries
    ) { };

    async execute(input: GetUserDataInput): Promise<GetUserDataOutput> {
        try {
            return await this.useQueries.findStats(input);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to fetch graph data");
        };
    };
};