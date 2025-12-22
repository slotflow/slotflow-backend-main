import { Types } from "mongoose";

// TODO need to use redis instead of mongodb

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