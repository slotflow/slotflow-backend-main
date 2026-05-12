import { CreditAccountQueries } from "../../infrastructure/queriesImpls";
import { creditTransactionRepository } from "../../infrastructure/repositoryImpls";
import { GetCreditTransactionsUseCase } from "../../application/useCases/credits/getCreditTransactions.useCase";
import { GetCreditAccountDetailsUseCase } from "../../application/useCases/credits/getCreditAccountDetails.useCase";

export const getCreditAccountDetailsUseCase = new GetCreditAccountDetailsUseCase(CreditAccountQueries);

export const getCreditTransactionsUseCase = new GetCreditTransactionsUseCase(creditTransactionRepository);