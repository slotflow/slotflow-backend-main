import { CreditTransactionType, CreditTransactionSource, CreditTransactionStatus } from "../enums/creditTransaction.enum";

export type CreateCreditTransactionProps = {
  accountId: string;
  userId: string;
  type: CreditTransactionType;
  credits: number;
  balanceAfter: number;
  source: CreditTransactionSource;
  referenceId?: string;
  idempotencyKey?: string;
};

export type UpdateCreditTransactionStatusProps = {
  status: CreditTransactionStatus;
};
