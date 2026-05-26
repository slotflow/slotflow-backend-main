import { CreditTransactionSource, CreditTransactionStatus, CreditTransactionType } from "../enums/creditTransaction.enum";

export interface CreditTransactionProps {
  _id: string;
  accountId: string;
  userId: string;
  type: CreditTransactionType;
  credits: number;
  balanceAfter: number;
  source: CreditTransactionSource;
  status: CreditTransactionStatus;
  referenceId?: string; // subscriptionId or appointment / bookingId
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}