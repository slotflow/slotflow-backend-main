import { ProviderProfileDTO, UserDTO } from "./common.dto";

// provider update identity proof request payload interface
export type ProviderUpdateIdentityProofRequest = Pick<ProviderProfileDTO, "identityProof"> & {
    providerId: UserDTO["_id"];
}
// provider update service proof use case response interface
export type ProviderUpdateIdentityProofResponse = ProviderProfileDTO["identityProof"];


// provider update service proof request payload interface
export type ProviderUpdateServiceProofRequest = Pick<ProviderProfileDTO, "serviceProof"> & {
    providerId: UserDTO["_id"];
}
// provider update service proof use case response interface
export type ProviderUpdateServiceProofResponse = ProviderProfileDTO["serviceProof"];


// provider admin approval
export interface ProviderAdminApprovalRequest {
    providerId: UserDTO["_id"];
}
// provider admin approval response interface
export type ProviderAdminApprovalResponse = Pick<ProviderProfileDTO, "adminVerificationStatus">;


// provider delete proof request
export interface ProviderDeleteProofRequest {
    providerId: UserDTO["_id"];
}