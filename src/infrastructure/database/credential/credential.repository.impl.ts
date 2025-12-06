import { Types } from "mongoose";
import { CreateCredentialRequest, UpdateCredentialRequest } from "../../dtos/common.dto";
import { CredentialModel, ICredential } from "./credential.model";
import { Credential } from "../../../domain/entities/credential.entity";
import { ICredentialRepository } from "../../../domain/interfaces/repositories/ICredentialRepository";

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

    async createCredential(data: CreateCredentialRequest): Promise<Credential> {
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

    async updateCredential(data: UpdateCredentialRequest): Promise<Credential | null> {
        try {
            const updated = await CredentialModel.findOneAndUpdate(
                { _id: data._id },
                { $set: { accessToken: data.accessToken, refreshToken: data.refreshToken, expiryDate: data.expiryDate } },
                { new: true }
            );
            return updated ? this.mapToEntity(updated) : null;
        } catch (error) {
            console.log("updateCredential error : ", error);
            throw new Error("Failed to update credentials");
        }
    }
}