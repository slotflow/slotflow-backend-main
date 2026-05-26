import { creditAccountQueries } from "../../infrastructure/queriesImpls";
import { creditTransactionRepository } from "../../infrastructure/repositoryImpls";
import { GetCreditTransactionsUseCase } from "../../application/useCases/credits/getCreditTransactions.useCase";
import { GetCreditDetailsUseCase } from "../../application/useCases/credits/getCreditDetails.useCase";

export const getCreditDetailsUseCase = new GetCreditDetailsUseCase(creditAccountQueries);

export const getCreditTransactionsUseCase = new GetCreditTransactionsUseCase(creditTransactionRepository);