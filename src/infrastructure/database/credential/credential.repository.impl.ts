import { CredentialModel } from "./credential.model";
import { CredentialMapper } from "../../mappers/credential.mapper";
import { Credential } from "../../../domain/entities/credential.entity";
import { ICredentialRepository } from "../../../domain/interfaces/repositories/ICredentialRepository";

export class CredentialRepositoryImpl implements ICredentialRepository {

    async create(credential: Credential): Promise<Credential> {
        const persistence = CredentialMapper.toPersistence(credential);
        const created = await CredentialModel.create(persistence);
        return CredentialMapper.toDomain(created);
    };

    async findByUserId(userId: string): Promise<Credential | null> {
        const doc = await CredentialModel.findOne({userId});
        return doc ? CredentialMapper.toDomain(doc) : null;
    };

    async update(credential: Credential): Promise<Credential> {
        const persistence = CredentialMapper.toPersistence(credential);

        const updated = await CredentialModel.findByIdAndUpdate(
            credential._id,
            persistence,
            { new: true }
        );

        if (!updated) {
            throw new Error("Credential not found");
        }

        return CredentialMapper.toDomain(updated);
    };

};