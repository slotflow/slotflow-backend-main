import { ProviderProfileDTO, UserDTO } from "./common.dto";

//// **** providerProfile dtos **** ////

// ProviderUpdateIdentityProof usecase input output
export type ProviderUpdateIdentityProofRequest = Pick<ProviderProfileDTO, "identityProof"> & {
    providerId: UserDTO["_id"];
}
export type ProviderUpdateIdentityProofResponse = ProviderProfileDTO["identityProof"];


// ProviderUpdateServiceProof usecase input output
export type ProviderUpdateServiceProofRequest = Pick<ProviderProfileDTO, "serviceProof"> & {
    providerId: UserDTO["_id"];
}
export type ProviderUpdateServiceProofResponse = ProviderProfileDTO["serviceProof"];


// ProviderAdminApproval usecase input output
export interface ProviderAdminApprovalRequest {
    providerId: UserDTO["_id"];
}
export type ProviderAdminApprovalResponse = Pick<ProviderProfileDTO, "adminVerificationStatus">;


// ProviderDeleteProof usecase input output
export interface ProviderDeleteProofRequest {
    providerId: UserDTO["_id"];
}