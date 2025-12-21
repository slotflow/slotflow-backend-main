import { ProviderServiceProps } from "../contracts/providerService.contract";

export type CreateProviderServiceProps = Omit<ProviderServiceProps, "_id" | "createdAt" | "updatedAt">;

export type UpdateProviderServiceProps = Omit<ProviderServiceProps, "_id" | "providerId" | "createdAt" | "updatedAt">