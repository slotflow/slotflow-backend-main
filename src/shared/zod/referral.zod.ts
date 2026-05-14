import z from "zod";
import { paginationSchema } from "./base.zod";
import { ReferralStatus } from "../../domain/enums/common.enum";

export const getReferralsListSchema = z.object({
    status: z.nativeEnum(ReferralStatus).optional(),
}).merge(paginationSchema);