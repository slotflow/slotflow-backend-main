import { Types } from "mongoose";

export class Credential {
    constructor(
        public _id: Types.ObjectId,
        public userId: Types.ObjectId,
        public accessToken: string,
        public refreshToken: string,
        public expiryDate: Date,
        public createdAt: Date,
        public updatedAt: Date,
    ) { }
}