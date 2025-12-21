import { ServiceProps } from "../contracts/service.contract";

export type CreateServiceProps = Omit<ServiceProps, "_id" | "createdAt" | "updatedAt">;

export type UpdateServiceProps = Omit<ServiceProps, "_id" | "createdAt" | "updatedAt">;