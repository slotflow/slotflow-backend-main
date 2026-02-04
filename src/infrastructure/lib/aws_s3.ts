import { awsConfig } from '../../config/env';
import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: awsConfig.awsRegion!,
  credentials: {
    accessKeyId: awsConfig.awsAccessKeyId!,
    secretAccessKey: awsConfig.awsSecretAccessKey!,
  },
});