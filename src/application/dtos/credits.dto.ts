import { CommonDateInput, MiniCardData } from "./common.dto";
import { UserProps } from "../../domain/contracts/user.contract";
import { CreditAccountProps } from "../../domain/contracts/creditAccount.contract";
import { CreditTransactionProps } from "../../domain/contracts/creditTransation.contract";
import { CreditTransactionSource, CreditTransactionStatus, CreditTransactionType } from "../../domain/enums/creditTransaction.enum";

/**
 * Credit queries dtos
 */

// GetCreditAccountDetails method 
export interface GetCreditAccountDetailsQuery extends CommonDateInput {
  userId: UserProps["_id"]
  timeZone: string;
}
export interface CreditMainChartData {
  date: string;
  totalCredits: number;
  spentCredits: number;
  balanceCredits: number;
}
export type GetCreditAccountDetailsView = Pick<CreditAccountProps, "isActive"> & {
  totalCredits: MiniCardData;
  spentCredits: MiniCardData;
  balanceCredits: MiniCardData
  chartData: CreditMainChartData[];
}
export type CreditChartKeys =
    | "totalCredits"
    | "spentCredits"
    | "balanceCredits"





/**
 * Credit usecase dtos
 */

// GetCreditAccountDetails method  
export type GetCreditAccountDetailsInput = GetCreditAccountDetailsQuery;
export type GetCreditAccountDetailsOutput = GetCreditAccountDetailsView;


// GetCreditTransactions method 
export interface GetCreditTransactionsInput extends CommonDateInput {
  userId: UserProps["_id"];
  page: number;
  limit: number;
  status?: CreditTransactionStatus;
  type?: CreditTransactionType;
  source?: CreditTransactionSource;
  timeZone?: string;
}
export type GetCreditTransactionsOutput = Pick<CreditTransactionProps, "status" | "type" | "source" | "credits" | "balanceAfter">;