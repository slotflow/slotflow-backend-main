import { s3Client } from "../../infrastructure/cloud/aws/aws_s3";
import { signedUrlService } from "../../infrastructure/services";
import { CreateFileSignedUrlUseCase, CreateFileUploadPresignedUrlUseCase } from "../../application/useCases/common/s3.useCase";

// s3 controller dependency injection
export const createFileUploadPresignedUrlUseCase = new CreateFileUploadPresignedUrlUseCase(s3Client);
export const createFileSignedUrlUseCase = new CreateFileSignedUrlUseCase(signedUrlService);