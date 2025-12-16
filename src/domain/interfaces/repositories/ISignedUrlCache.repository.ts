import { SignedUrlCache } from "../../entities/signedUrlCache.entity";

export type CreateSignedUrlRequest = Pick<SignedUrlCache, "key" | "url" | "expiresAt">;

export type UpdateSignedUrlRequest = Pick<SignedUrlCache, "key" | "url" | "expiresAt">;

export type FindSignedUrlRequest = Pick<SignedUrlCache, "key">;

export type deleteSignedUrlRequest = Pick<SignedUrlCache, "_id">;

export interface ISignedUrlCacheRepository {
    createSignedUrl(payload: CreateSignedUrlRequest): Promise<SignedUrlCache>;

    findSignedUrl(payload: FindSignedUrlRequest): Promise<SignedUrlCache>;

    updateSignedUrl(payload: CreateSignedUrlRequest): Promise<SignedUrlCache>;

    deleteSignedUrl(payload: deleteSignedUrlRequest): Promise<boolean>;
}