import { awsConfig } from '../../config/env';
import { s3Client } from '../../config/aws_s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SignedUrlCacheRepositoryImpl } from '../database/signedUrl/signedUrlCacheRepository.impl';

export class GenerateSignedUrlService {
  constructor(
    private signedUrlCacheRepositoryImpl: SignedUrlCacheRepositoryImpl
  ) { }

  async execute(key: string, expires: number = 172800): Promise<string> {

    const existing = await this.signedUrlCacheRepositoryImpl.findSignedUrl({ key });

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

    await this.signedUrlCacheRepositoryImpl.updateSignedUrl({ key, url: signedUrl, expiresAt });

    return signedUrl;
  }
}
