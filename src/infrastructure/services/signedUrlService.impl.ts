import { Redis } from "@upstash/redis";
import { log } from "../../shared/logger/logger";
import { awsConfig, redisConfig } from "../../config/env";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ISignedUrlService } from "../../domain/interfaces/services/ISignedUrl.service";

export class SignedUrlServiceImpl implements ISignedUrlService {
    constructor(
        private readonly redis: Redis,
        private readonly s3Client: S3Client
    ) { };

    private buildRedisKey(key: string): string {
        return `signedurl:${key}`;
    };

    async get(key: string): Promise<string> {
        try {
            if (!key) {
                throw new Error("Invalid request");
            };

            const redisKey = this.buildRedisKey(key);

            const cachedSignedUrl = await this.redis.get<string>(redisKey);

            if (cachedSignedUrl) {
                return cachedSignedUrl;
            };

            const command = new GetObjectCommand({
                Bucket: awsConfig.awsS3BucketName!,
                Key: key,
            });

            const signedUrl = await getSignedUrl(
                this.s3Client,
                command,
                { expiresIn: awsConfig.awsUrlExpires }
            );

            await this.redis.set(
                redisKey,
                signedUrl,
                { ex: redisConfig.redisTtl }
            );

            return signedUrl;

        } catch (error) {
            log.error("SignedUrlService.get failed", error as Error);
            throw new Error("Failed to get signed Url");
        };
    };

    async save(key: string): Promise<string> {
        try {
            if (!key) {
                throw new Error("Invalid request");
            };

            const command = new GetObjectCommand({
                Bucket: awsConfig.awsS3BucketName!,
                Key: key,
            });

            const signedUrl = await getSignedUrl(
                this.s3Client,
                command,
                { expiresIn: awsConfig.awsUrlExpires }
            );

            const redisKey = this.buildRedisKey(key);

            await this.redis.set(
                redisKey,
                signedUrl,
                { ex: redisConfig.redisTtl }
            );

            return signedUrl;

        } catch (error) {
            log.error("SignedUrlService.save failed", error as Error);
            throw new Error("Failed to save signed url");
        };
    };

    async delete(key: string): Promise<boolean> {
        try {
            if (!key) {
                throw new Error("Invalid request");
            };

            const redisKey = this.buildRedisKey(key);
            const deletedCount = await this.redis.del(redisKey);
            return deletedCount === 1;
        } catch (error) {
            log.error("SignedUrlService delete failed", error as Error);
            throw error;
        };
    };

};
