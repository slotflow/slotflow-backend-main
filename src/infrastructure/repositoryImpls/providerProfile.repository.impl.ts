import { ProviderProfileModel } from "../models/providerProfile.model";
import { ProviderProfileMapper } from "../mappers/providerProfile.mapper";
import { ProviderProfile } from "../../domain/entities/providerProfile.entity";
import { IProviderProfileRepository } from "../../domain/interfaces/repositories/IProviderProfile.repository";

export class ProviderProfileRepositoryImpl implements IProviderProfileRepository {

    async create(providerProfile: ProviderProfile): Promise<ProviderProfile> {
        const persistence = ProviderProfileMapper.toPersistence(providerProfile);
        const doc = await ProviderProfileModel.create(persistence);
        return ProviderProfileMapper.toDomain(doc);
    };

    async update(providerProfile: ProviderProfile): Promise<ProviderProfile> {
        const persistence = ProviderProfileMapper.toPersistence(providerProfile);

        const doc = await ProviderProfileModel.findByIdAndUpdate(
            providerProfile._id,
            { $set: persistence },
            { new: true }
        );

        if (!doc) {
            throw new Error("Provider not found");
        }

        return ProviderProfileMapper.toDomain(doc);
    };

    async findById(providerId: string): Promise<ProviderProfile | null> {
        const doc = await ProviderProfileModel.findById(providerId);
        return doc ? ProviderProfileMapper.toDomain(doc) : null;
    };

    async findByUserId(userId: string): Promise<ProviderProfile | null> {
        const doc = await ProviderProfileModel.findOne({ userId });
        return doc ? ProviderProfileMapper.toDomain(doc) : null;
    };

};