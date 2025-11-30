import { Types } from "mongoose";

export class SignedUrlCache {
    constructor(
        public _id: Types.ObjectId,
        public key: string,
        public url: string,
        public expiresAt: Date,
        public createdAt: Date,
        public updatedAt: Date,
    ) { }
}