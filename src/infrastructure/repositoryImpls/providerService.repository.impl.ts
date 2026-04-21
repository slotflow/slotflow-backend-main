import { ClientSession } from "mongoose";
import { ProviderServiceModel } from "../models/providerService.model";
import { ProviderServiceMapper } from "../mappers/providerService.mapper";
import { ProviderService } from "../../domain/entities/providerService.entity";
import { IProviderServiceRepository } from "../../domain/interfaces/repositories/IProviderService.repository";

export class ProviderServiceRepositoryImpl implements IProviderServiceRepository {

    async create(providerService: ProviderService, session?: ClientSession): Promise<ProviderService> {
        const persistence = ProviderServiceMapper.toPersistence(providerService);
        const doc = await ProviderServiceModel.create([persistence], { session });
        return ProviderServiceMapper.toDomain(doc[0]);
    };

    async update(providerService: ProviderService, session?: ClientSession): Promise<ProviderService | null> {
        const persistence = ProviderServiceMapper.toPersistence(providerService);

        const doc = await ProviderServiceModel.findByIdAndUpdate(
            providerService._id,
            { $set: persistence },
            { new: true, session }
        );

        return doc ? ProviderServiceMapper.toDomain(doc) : null;
    };

    async findById(providerServiceId: string): Promise<ProviderService | null> {
        const doc = await ProviderServiceModel.findById(providerServiceId);
        return doc ? ProviderServiceMapper.toDomain(doc) : null;
    };

};