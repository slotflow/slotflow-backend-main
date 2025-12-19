import { CredentialProps } from "../contracts/credential.contract";

export type CreateCredentialProps = Omit<CredentialProps, "_id" | "createdAt" | "updatedAt">;

export type UpdateCredentialProps = Partial<Omit<CredentialProps, "_id" | "userId" | "createdAt" | "updatedAt">>;