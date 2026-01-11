import { ProviderServiceModel } from "../database/providerService.model";
import { ProviderServiceMapper } from "../mappers/providerService.mapper";
import { ProviderService } from "../../domain/entities/providerService.entity";
import { IProviderServiceRepository } from "../../domain/interfaces/repositories/IProviderService.repository";

export class ProviderServiceRepositoryImpl implements IProviderServiceRepository {

    async create(providerService: ProviderService): Promise<ProviderService> {
        const persistence = ProviderServiceMapper.toPersistence(providerService);
        const doc = await ProviderServiceModel.create(persistence);
        return ProviderServiceMapper.toDomain(doc);
    };

    async update(providerService: ProviderService): Promise<ProviderService> {
        const persistence = ProviderServiceMapper.toPersistence(providerService);

        const doc = await ProviderServiceModel.findByIdAndUpdate(
            providerService._id,
            { $set: persistence},
            { new: true }
        );

        if (!doc) {
            throw new Error("Provider Service not found");
        };

        return ProviderServiceMapper.toDomain(doc);
    };

    async findById(providerServiceId: string): Promise<ProviderService | null> {
        const doc = await ProviderServiceModel.findById(providerServiceId);
        return doc ? ProviderServiceMapper.toDomain(doc) : null;
    };

};