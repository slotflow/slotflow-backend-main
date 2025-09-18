import mongoose, { Document, Schema, Types, model } from "mongoose";

export interface ICredential extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    accessToken: string;
    refreshToken: string;
    expiryDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const CredentialSchema = new Schema<ICredential>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
}, { timestamps: true });

export const CredentialModel = model<ICredential>("Credential", CredentialSchema);
