import mongoose, { Document, Types } from "mongoose";

export interface ISignedUrlCache extends Document {
    _id: Types.ObjectId,
    key: string;
    url: string;
    expiresAt: Date;
    createdAt: Date,
    updatedAt: Date,
};

const signedUrlCacheSchema = new mongoose.Schema({
    key: {
        type: String,
        required: [true, "key is required"],
        unique: [true, "key should be unique"],
    },
    url: {
        type: String,
        required: [true, "url is required"],
    },
    expiresAt: {
        type: Date,
        require: [true, "expiresAt is required"],
        index: {
            expires: 0
        }
    }
}, {
    timestamps: true
});

export const SignedUrlCacheModel = mongoose.model<ISignedUrlCache>('SignedUrlCache', signedUrlCacheSchema)
