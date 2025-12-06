import { awsConfig } from "../../config/env";
import { s3Client } from "../../config/aws_s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ISignedUrlService } from "../../domain/interfaces/services/ISignedUrl.service";
import { ISignedUrlCacheRepository } from "../../domain/interfaces/repositories/ISignedUrlCache.repository";

export class SignedUrlService implements ISignedUrlService {
    constructor(
        private signedUrlCacheRepository: ISignedUrlCacheRepository
    ) { }

    async generate(key: string, expires: number = 172800): Promise<string> {
        try {
            const existing = await this.signedUrlCacheRepository.findSignedUrl({ key });

            if (existing && existing.expiresAt > new Date()) {
                return existing.url;
            }

            const urlParts = key.split('/');
            const s3Key = urlParts.slice(3).join('/');

            if (!s3Key) throw new Error('Invalid S3 key');

            const command = new GetObjectCommand({
                Bucket: awsConfig.aws_s3Bucket_name!,
                Key: s3Key,
            });

            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: expires });

            const expiresAt = new Date(Date.now() + expires * 1000);

            await this.signedUrlCacheRepository.updateSignedUrl({ key, url: signedUrl, expiresAt });

            return signedUrl;
        } catch (error) {
            console.log("SignedUrlService generate error : ", error);
            throw new Error("Failed to generate signed Url");
        }
    }
}