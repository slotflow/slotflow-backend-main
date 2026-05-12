import z from "zod";
import { dateSchema, paginationSchema } from "./base.zod";
import { CreditTransactionSource, CreditTransactionStatus, CreditTransactionType } from "../../domain/enums/creditTransaction.enum";

export const getCreditTransactionsSchema = z.object({
    startDate: dateSchema,
    endDate: dateSchema,
    status: z.nativeEnum(CreditTransactionStatus).optional(),
    type: z.nativeEnum(CreditTransactionType).optional(),
    source: z.nativeEnum(CreditTransactionSource).optional(),
}).merge(paginationSchema);