import { S3Client } from '@aws-sdk/client-s3';
import { awsConfig } from './env';

const s3Client = new S3Client({
  region: awsConfig.aws_region!,
  credentials: {
    accessKeyId: awsConfig.aws_access_key_id!,
    secretAccessKey: awsConfig.aws_secret_access_key!,
  },
});

export { s3Client };