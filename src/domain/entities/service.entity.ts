import { Types } from "mongoose";
import { ServiceCategoryType } from "../../infrastructure/dtos/common.dto";

export class Service {
    constructor(
        public _id: Types.ObjectId,
        public serviceName: string,
        public serviceCategory: ServiceCategoryType,
        public isBlocked: boolean,
        public createdAt: Date,
        public updatedAt: Date,
    ){}
}