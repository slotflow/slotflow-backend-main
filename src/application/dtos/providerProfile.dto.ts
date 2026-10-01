import { UserProps } from "../../domain/contracts/user.contract";
import { ProviderProfileProps } from "../../domain/contracts/providerProfile.contract";

/**
 * Provider profile usecase dtos
 */


// ProviderUpdateIdentityProof
export type ProviderUpdateIdentityProofRequest = Pick<ProviderProfileProps, "identityProof"> & {
    providerId: UserProps["_id"];
}
export type ProviderUpdateIdentityProofResponse = ProviderProfileProps["identityProof"];


// ProviderUpdateServiceProof 
export type ProviderUpdateServiceProofRequest = Pick<ProviderProfileProps, "serviceProof"> & {
    providerId: UserProps["_id"];
}
export type ProviderUpdateServiceProofResponse = ProviderProfileProps["serviceProof"];


// ProviderAdminApproval 
export interface ProviderAdminApprovalRequest {
    providerId: UserProps["_id"];
}
export type ProviderAdminApprovalResponse = Pick<ProviderProfileProps, "adminVerificationStatus">;


// ProviderDeleteProof 
export interface ProviderDeleteProofRequest {
    providerId: UserProps["_id"];
}