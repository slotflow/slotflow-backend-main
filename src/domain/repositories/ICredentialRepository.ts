import { Types } from "mongoose";
import { Credential } from "../entities/credential.entity";
import { CreateCredential } from "../../infrastructure/dtos/common.dto";

export interface ICredentialRepository {

    createCredential(data: CreateCredential): Promise<Credential>;

    findCredentialByUserId(userId: Types.ObjectId): Promise<Credential | null>;

    updateCredential(credential: Credential): Promise<Credential | null>;

}