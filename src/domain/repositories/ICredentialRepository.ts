import { Types } from "mongoose";
import { Credential } from "../entities/credential";
import { CreateCredential } from "../../infrastructure/dtos/common.dto";

export interface ICredentialRepository {

    createCredential(data: CreateCredential): Promise<Credential>;

    getCredentialByUserId(userId: Types.ObjectId): Promise<Credential | null>;

    updateCredential(credential: Credential): Promise<Credential | null>;

}