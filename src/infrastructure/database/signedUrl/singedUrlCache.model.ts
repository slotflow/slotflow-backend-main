import mongoose, { Document } from "mongoose";

export interface ISignedUrlCache extends Document {
    key: string;
    url: string;
    expiresAt: Date;
};

const signedUrlCacheSchema = new mongoose.Schema({
    key : {
        type: String,
        required: [true, "key is required"],
        unique: [true, "key should be unique"],
    },
    url : {
        type: String,
        required: [true, "url is required"],
    },
    expiresAt: {
        type: Date,
        require: [true, "expiresAt is required"],
        index : {
            expires : 0
        }
    }
});

export const SignedUrlCacheModel = mongoose.model<ISignedUrlCache>('SignedUrlCache',signedUrlCacheSchema)
