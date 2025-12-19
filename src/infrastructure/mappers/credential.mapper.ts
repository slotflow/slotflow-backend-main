import { Types } from "mongoose";
import { Credential } from "../../domain/entities/credential.entity";
import { ICredential } from "../database/credential/credential.model";

export class CredentialMapper {

    static toDomain(doc: ICredential): Credential {
        return new Credential({
            _id: doc._id.toString(),
            accessToken: doc.accessToken,
            expiryDate: doc.expiryDate,
            refreshToken: doc.refreshToken,
            userId: doc.userId.toString(),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    static toPersistence(entity: Credential) {
        const props = entity.getProps();

        return {
            accessToken: props.accessToken,
            expiryDate: props.expiryDate,
            refreshToken: props.refreshToken,
            userId: new Types.ObjectId(props.userId),
            updatedAt: props.updatedAt,
        };
    }
}
