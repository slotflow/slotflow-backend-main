import z from "zod";
import { dateOnlySchema, paginationSchema } from "./base.zod";
import {
  CreditTransactionSource,
  CreditTransactionStatus,
  CreditTransactionType,
} from "../../domain/enums/creditTransaction.enum";

export const getCreditTransactionsSchema = z
  .object({
    startDate: dateOnlySchema,
    endDate: dateOnlySchema,
    status: z.nativeEnum(CreditTransactionStatus).optional(),
    type: z.nativeEnum(CreditTransactionType).optional(),
    source: z.nativeEnum(CreditTransactionSource).optional(),
  })
  .merge(paginationSchema);
