import { ISignedUrlCache, SignedUrlCacheModel } from "./signedUrlCache.model";
import { SignedUrlCache } from "../../../domain/entities/signedUrlCache.entity";
import { CreateSignedUrlRequest, FindSignedUrlRequest, ISignedUrlCacheRepository } from "../../../domain/repositories/ISignedUrlCache.repository";

export class SignedUrlCacheRepositoryImpl implements ISignedUrlCacheRepository {

    private mapToEntity(signedUrl: ISignedUrlCache): SignedUrlCache {
        return new SignedUrlCache(
            signedUrl._id,
            signedUrl.key,
            signedUrl.url,
            signedUrl.expiresAt,
            signedUrl.createdAt,
            signedUrl.updatedAt,
        )
    }

    async createSignedUrl(data: CreateSignedUrlRequest): Promise<SignedUrlCache> {
        try {
            const created = await SignedUrlCacheModel.create(data);
            return this.mapToEntity(created);
        } catch (error) {
            console.log("createSignedUrl error : ", error);
            throw new Error("Failed to created signed url");
        }
    }

    async findSignedUrl(data: FindSignedUrlRequest): Promise<SignedUrlCache> {
        try {
            const existing = await SignedUrlCacheModel.findOne({ key: data.key });

            if (!existing) return null as any;

            return this.mapToEntity(existing);
        } catch (error) {
            console.log("findSignedUrl error : ", error);
            throw new Error("Failed to find signed url");
        }
    }

    async updateSignedUrl(data: CreateSignedUrlRequest): Promise<SignedUrlCache> {
        try {
            const updated = await SignedUrlCacheModel.findOneAndUpdate(
                { key: data.key },
                data,
                { upsert: true, new: true }
            );

            return this.mapToEntity(updated as ISignedUrlCache);
        } catch (error) {
            console.log("updateSignedUrl error : ", error);
            throw new Error("Failed to update signed url");
        }
    }
}
