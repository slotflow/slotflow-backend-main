import { S3Client } from '@aws-sdk/client-s3';
import { awsConfig } from '../../../config/env';

export const s3Client = new S3Client({
  region: awsConfig.awsRegion!,
  credentials: {
    accessKeyId: awsConfig.awsAccessKeyId!,
    secretAccessKey: awsConfig.awsSecretAccessKey!,
  },
});