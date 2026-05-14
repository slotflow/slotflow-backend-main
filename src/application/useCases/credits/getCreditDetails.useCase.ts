import { toAppError } from "../../../shared/error/handleUnknownError";
import { ICreditAccountQueries } from "../../queries/ICreditAccount.queries";
import { GetCreditAccountDetailsInput, GetCreditAccountDetailsOutput } from "../../dtos/credits.dto";

export class GetCreditDetailsUseCase {
    constructor(
        private readonly creditAccountQueries: ICreditAccountQueries
    ) { }

    async execute(input: GetCreditAccountDetailsInput): Promise<GetCreditAccountDetailsOutput> {
        try {
            return await this.creditAccountQueries.findCreditDetails(input);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get credit account details")
        }
    }
}