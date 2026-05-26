import { TableData } from "../../dtos/common.dto";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { GetCreditTransactionsInput, GetCreditTransactionsOutput } from "../../dtos/credits.dto";
import { ICreditTransactionRepository } from "../../../domain/interfaces/repositories/ICreditTransaction.repository";

export class GetCreditTransactionsUseCase {
    constructor(
        private readonly creditTransactionRepository: ICreditTransactionRepository
    ) {}
    
    async execute(input: GetCreditTransactionsInput): Promise<TableData<Array<GetCreditTransactionsOutput>>> {
        try {
            const result = await this.creditTransactionRepository.findByUserIdWithFilters(
                input.userId,
                input.startDate,
                input.endDate,
                input.page,
                input.limit,
                input.status,
                input.type,
                input.source
            );

            return {
                items: result?.items?.map( t => ({
                _id: t._id,
                status: t.status,
                type: t.type,
                source: t.source,
                credits: t.credits,
                balanceAfter: t.balanceAfter,
            })),    
            currentPage: result.currentPage,
            totalCount: result.totalCount,
            totalPages: result.totalPages
        };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to fetch credit transactions");
        }
    }
}