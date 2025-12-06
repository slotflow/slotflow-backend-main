import { SignedUrlCache } from "../entities/signedUrlCache.entity";

export type CreateSignedUrlRequest = Pick<SignedUrlCache, "key" | "url" | "expiresAt">;

export type FindSignedUrlRequest = Pick<SignedUrlCache, "key">;

export interface ISignedUrlCacheRepository {
    createSignedUrl(data: CreateSignedUrlRequest): Promise<SignedUrlCache>;

    findSignedUrl(data: FindSignedUrlRequest): Promise<SignedUrlCache>;

    updateSignedUrl(data: CreateSignedUrlRequest): Promise<SignedUrlCache>
}