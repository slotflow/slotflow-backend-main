import z from "zod";
import { ServiceCategory } from "../../domain/enums/service.enum";

// User get providers for the dashboard provider listing
export const userGetProvidersServicesSchema = z.object({
    appServiceIds: z.union([z.string(), z.array(z.string())]).optional(),
    maxPrice: z.coerce.number().optional(),
    minPrice: z.coerce.number().optional(),
    slotflowTrusted: z
        .enum(["true", "false"])
        .transform(val => val === "true")
        .optional(),
    categories: z.nativeEnum(ServiceCategory).array().optional(),
    location: z.object({
        type: z.literal("Point"),
        coordinates: z
            .tuple([z.coerce.number(), z.coerce.number()])
            .refine((arr) => arr.length === 2, "Coordinates must be [lon, lat]"),
    }).optional(),
    skip: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
});