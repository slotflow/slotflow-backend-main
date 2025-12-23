import { ProviderModel } from "./provider.model";
import { ProviderMapper } from "../../mappers/provider.mapper";
import { Provider } from "../../../domain/entities/provider.entity";
import { IProviderRepository } from '../../../domain/interfaces/repositories/IProvider.repository';

export class ProviderRepositoryImpl implements IProviderRepository {

    async create(provider: Provider): Promise<Provider> {
        const persistence = ProviderMapper.toPersistence(provider);
        const doc = await ProviderModel.create(persistence);
        return ProviderMapper.toDomain(doc);
    };

    async update(provider: Provider): Promise<Provider> {
        const persistence = ProviderMapper.toPersistence(provider);

        const doc = await ProviderModel.findByIdAndUpdate(
            provider._id,
            { $set: persistence },
            { new: true }
        );

        if (!doc) {
            throw new Error("Provider not found");
        }

        return ProviderMapper.toDomain(doc);
    };

    async findById(providerId: string): Promise<Provider | null> {
        const doc = await ProviderModel.findById(providerId);
        return doc ? ProviderMapper.toDomain(doc) : null;
    };

    async findByEmail(email: string): Promise<Provider | null> {
        const doc = await ProviderModel.findOne({ email });
        return doc ? ProviderMapper.toDomain(doc) : null;
    };

    async findByGoogleId(googleId: string): Promise<Provider | null> {
        const doc = await ProviderModel.findOne({ googleId });
        return doc ? ProviderMapper.toDomain(doc) : null;
    };

    async findByVerificationToken(token: string): Promise<Provider | null> {
        const doc = await ProviderModel.findOne({ verificationToken: token });
        return doc ? ProviderMapper.toDomain(doc) : null;
    };

    async count(today?: boolean): Promise<number> {
        if (!today) {
            return ProviderModel.countDocuments();
        }

        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        return ProviderModel.countDocuments({
            createdAt: { $gte: start, $lte: end }
        });
    };

    async findAll(page: number, limit: number): Promise<{ data: Array<Provider>, totalPages: number; currentPage: number; totalCount: number; }> {
        const skip = (page - 1) * limit;
        const [providers, totalCount] = await Promise.all([
            ProviderModel.find({}, {
                _id: 1,
                username: 1,
                email: 1,
                isBlocked: 1,
                isAdminVerified: 1,
                adminVerificationStatus: 1,
                isEmailVerified: 1,
                trustedBySlotflow: 1
            }).skip(skip).limit(limit).lean(),
            ProviderModel.countDocuments(),
        ]);
        const totalPages = Math.ceil(totalCount / limit);

        return {
            data: providers.map(provider => ProviderMapper.toDomain(provider)),
            totalPages,
            currentPage: page,
            totalCount
        };
    };

};