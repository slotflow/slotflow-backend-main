import { CredentialMapper } from "../mappers/credential.mapper";
import { Credential } from "../../domain/entities/credential.entity";
import { CredentialModel } from "../database/credential.model";
import { ICredentialRepository } from "../../domain/interfaces/repositories/ICredentialRepository";

export class CredentialRepositoryImpl implements ICredentialRepository {

    async create(credential: Credential): Promise<Credential> {
        const persistence = CredentialMapper.toPersistence(credential);
        const doc = await CredentialModel.create(persistence);
        return CredentialMapper.toDomain(doc);
    };

    async findByUserId(userId: string): Promise<Credential | null> {
        const doc = await CredentialModel.findOne({ userId });
        return doc ? CredentialMapper.toDomain(doc) : null;
    };

    async update(credential: Credential): Promise<Credential> {
        const persistence = CredentialMapper.toPersistence(credential);

        const doc = await CredentialModel.findByIdAndUpdate(
            credential._id,
            persistence,
            { new: true }
        );

        if (!doc) {
            throw new Error("Credential not found");
        }

        return CredentialMapper.toDomain(doc);
    };

    async findById(credentialId: string): Promise<Credential | null> {
        const doc = await CredentialModel.findById(credentialId);
        return doc ? CredentialMapper.toDomain(doc) : null;
    }

};