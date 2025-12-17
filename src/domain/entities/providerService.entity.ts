import { Types } from 'mongoose';
import { ServiceModeType, ServiceTypeType } from '../../application/dtos/common.dto';

export class ProviderService {
    constructor(
        public _id: Types.ObjectId,
        public providerId: Types.ObjectId,
        public service: Types.ObjectId,
        public serviceName: string,
        public serviceDescription: string,
        public servicePrice: number,
        public serviceExperience: string,
        public requirements: string,
        public serviceType: ServiceTypeType,
        public serviceMode: ServiceModeType,
        public tags: string[],
        public videoUrl: string,
        public maxParticipants: number,
        public isGroupService: boolean,
        public createdAt: Date,
        public updatedAt: Date,
    ) { }
}