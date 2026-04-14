import { log } from "../../../../shared/logger/logger";
import { IUserQueries } from "../../../queries/IUser.queries";
import { GetProviderDataInput, GetProviderDataOutput } from "../../../dtos/user.dto";

export class GetProviderDataUseCase {
    constructor(
        private userQueries: IUserQueries
    ) { };

    async execute(input: GetProviderDataInput): Promise<GetProviderDataOutput> {
        try {
            return await this.userQueries.findproviderStats(input);
        } catch (error) {
            log.error("GetProviderDataUseCase failed", error as Error);
            throw error;
        };
    };
};