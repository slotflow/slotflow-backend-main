import { CreditTransactionSource, CreditTransactionStatus, CreditTransactionType } from "../../domain/enums/creditTransaction.enum";
import { CreditAccountDTO, CreditTransactionDTO, MiniCardData, UserDTO } from "./common.dto";

//// **** credits  dtos **** ////

//// **** credits queries query and view **** ////

// 1. GetCreditAccountDetails method query and view 
export interface GetCreditAccountDetailsQuery {
  userId: UserDTO["_id"]
  startDate: Date;
  endDate: Date;
}
export interface CreditMainChartData {
  date: string;
  totalCredits: number;
  spentCredits: number;
  balanceCredits: number;
}
export type GetCreditAccountDetailsView = Pick<CreditAccountDTO, "isActive"> & {
  totalCredits: MiniCardData;
  spentCredits: MiniCardData;
  balanceCredits: MiniCardData
  chartData: CreditMainChartData[];
}
export type CreditChartKeys =
    | "totalCredits"
    | "spentCredits"
    | "balanceCredits"





//// **** credits usecases input output **** ////

// 1. GetCreditAccountDetails method input output 
export type GetCreditAccountDetailsInput = GetCreditAccountDetailsQuery;
export type GetCreditAccountDetailsOutput = GetCreditAccountDetailsView;

// 2. GetCreditTransactions method input output 
export interface GetCreditTransactionsInput {
  userId: UserDTO["_id"];
  startDate: Date;
  endDate: Date;
  page: number;
  limit: number;
  status?: CreditTransactionStatus;
  type?: CreditTransactionType;
  source?: CreditTransactionSource;
}
export type GetCreditTransactionsOutput = Pick<CreditTransactionDTO, "status" | "type" | "source" | "credits" | "balanceAfter">;