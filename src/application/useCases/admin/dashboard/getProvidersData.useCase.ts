import { IUserQueries } from "../../../queries/IUser.queries";
import { toAppError } from "../../../../shared/error/handleUnknownError";
import { GetProviderDataInput, GetProviderDataOutput } from "../../../dtos/admin.dto";

export class GetProviderDataUseCase {
    constructor(
        private userQueries: IUserQueries
    ) { };

    async execute(input: GetProviderDataInput): Promise<GetProviderDataOutput> {
        try {
            return await this.userQueries.findproviderStats(input);
        } catch (error: unknown) {
           throw toAppError(error, "Failed to fetch provider data");
        };
    };
};