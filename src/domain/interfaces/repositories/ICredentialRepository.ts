import { Credential } from "../../entities/credential.entity";

export interface ICredentialRepository {

    create(credential: Credential): Promise<Credential>;

    findByUserId(userId: string): Promise<Credential | null>;

    update(credential: Credential): Promise<Credential | null>;

    findById(credentialId: string): Promise<Credential | null>;

}