import { ClientSession } from "mongoose";
import { ProviderProfileModel } from "../models/providerProfile.model";
import { ProviderProfileMapper } from "../mappers/providerProfile.mapper";
import { ProviderProfile } from "../../domain/entities/providerProfile.entity";
import { IProviderProfileRepository } from "../../domain/interfaces/repositories/IProviderProfile.repository";

export class ProviderProfileRepositoryImpl implements IProviderProfileRepository {

    async create(providerProfile: ProviderProfile, session?: ClientSession): Promise<ProviderProfile> {
        const doc = await ProviderProfileModel.create(
            [ProviderProfileMapper.toPersistence(providerProfile)],
            { session }
        );
        return ProviderProfileMapper.toDomain(doc[0]);
    };

    async update(providerProfile: ProviderProfile, session?: ClientSession): Promise<ProviderProfile | null> {
        const persistence = ProviderProfileMapper.toPersistence(providerProfile);

        const doc = await ProviderProfileModel.findByIdAndUpdate(
            providerProfile._id,
            { $set: persistence },
            { new: true, session }
        );

        return doc ? ProviderProfileMapper.toDomain(doc) : null;
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