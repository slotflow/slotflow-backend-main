import { Types } from "mongoose";
import { Credential } from "../../entities/credential.entity";
import { CreateCredentialRequest, UpdateCredentialRequest } from "../../../application/dtos/common.dto";

export interface ICredentialRepository {

    createCredential(data: CreateCredentialRequest): Promise<Credential>;

    findCredentialByUserId(userId: Types.ObjectId): Promise<Credential | null>;

    updateCredential(credential: UpdateCredentialRequest): Promise<Credential | null>;

}