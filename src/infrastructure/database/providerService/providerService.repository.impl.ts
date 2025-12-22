import { ProviderServiceModel } from "./providerService.model";
import { ProviderServiceMapper } from "../../mappers/providerService.mapper";
import { ProviderService } from "../../../domain/entities/providerService.entity";
import { IProviderServiceRepository } from "../../../domain/interfaces/repositories/IProviderService.repository";

export class ProviderServiceRepositoryImpl implements IProviderServiceRepository {

    async create(providerService: ProviderService): Promise<ProviderService> {
        const persistence = ProviderServiceMapper.toPersistence(providerService);
        const created = await ProviderServiceModel.create(persistence);
        return ProviderServiceMapper.toDomain(created);
    };

    async update(providerService: ProviderService): Promise<ProviderService> {
        const persistence = ProviderServiceMapper.toPersistence(providerService);

        const updated = await ProviderServiceModel.findByIdAndUpdate(
            providerService._id,
            persistence,
            { new: true }
        );

        if (!updated) {
            throw new Error("Provider Service not found");
        };

        return ProviderServiceMapper.toDomain(updated);
    };

    async findById(providerServiceId: string): Promise<ProviderService | null> {
        const doc = await ProviderServiceModel.findById(providerServiceId);
        return doc ? ProviderServiceMapper.toDomain(doc) : null;
    };

};