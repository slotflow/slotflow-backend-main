import { Types } from "mongoose";
import { CreateCredential } from "../../dtos/common.dto";
import { Credential } from "../../../domain/entities/credential.entity";
import { CredentialModel, ICredential } from "./credential.model";
import { ICredentialRepository } from "../../../domain/repositories/ICredentialRepository";

export class CredentialRepositoryImpl implements ICredentialRepository {
    private mapToEntity(credential: ICredential): Credential {
        return new Credential(
            credential._id,
            credential.userId,
            credential.accessToken,
            credential.refreshToken,
            credential.expiryDate,
            credential.createdAt,
            credential.updatedAt,
        )
    }

    async createCredential(data: CreateCredential): Promise<Credential> {
        try {
            const created = await CredentialModel.create(data);
            return this.mapToEntity(created);
        } catch (error) {
            console.log("createCredential error : ", error);
            throw new Error("Failed to create credentials");
        }
    }

    async findCredentialByUserId(userId: Types.ObjectId): Promise<Credential | null> {
        try {
            const credential = await CredentialModel.findOne({ userId });
            return credential ? this.mapToEntity(credential) : null;
        } catch (error) {
            console.log("findCredentialByUserId error : ", error);
            throw new Error("Failed to find credentials");
        }
    }

    async updateCredential(credential: Credential): Promise<Credential | null> {
        try {
            const updated = await CredentialModel.findOneAndUpdate(
                { userId: credential.userId },
                { $set: credential },
                { new: true }
            );
            return updated ? this.mapToEntity(updated) : null;
        } catch (error) {
            console.log("updateCredential error : ", error);
            throw new Error("Failed to update credentials");
        }
    }
}