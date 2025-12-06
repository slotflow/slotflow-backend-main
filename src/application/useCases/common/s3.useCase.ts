import { randomUUID } from "crypto";
import { awsConfig } from "../../../config/env";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ISignedUrlCacheRepository } from "../../../domain/interfaces/repositories/ISignedUrlCache.repository";
import { ApiResponse, CreareFileUploadPresignedUrlRequest, CreareFileUploadPresignedUrlResponse, CreateFileSignedUrlRequest } from "../../../infrastructure/dtos/common.dto";

export class CreateFileUploadPresignedUrlUseCase {
    constructor(
        private s3Client: S3Client
    ) { }

    async execute(data: CreareFileUploadPresignedUrlRequest): Promise<ApiResponse<CreareFileUploadPresignedUrlResponse>> {
        try {
            const { fileName, fileType, folderName } = data;

            if (!fileName || !fileType || !folderName) throw new Error("Invalid request");

            const ext = fileName.split(".").pop();
            if (!ext) throw new Error("Invalid file name");

            const key = `${folderName}/${Date.now()}-${randomUUID()}.${ext}`;

            const command = new PutObjectCommand({
                Bucket: awsConfig.aws_s3Bucket_name,
                Key: key,
                ContentType: fileType,
            });

            const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 300 });


            return {
                success: true,
                message: "Presigned url generated",
                data: {
                    key,
                    uploadUrl
                },
            };

        } catch (error) {
            console.log("CreateFileUploadPresignedUrlUseCase error : ", error);
            throw new Error("Failed to create presigned url");
        }
    }
}

export class CreateFileSignedUrlUseCase {
    constructor(
        private s3Client: S3Client,
        private signedUrlCacheRepository: ISignedUrlCacheRepository
    ) { }

    async execute(payload: CreateFileSignedUrlRequest): Promise<ApiResponse<string>> {
        try {
            const { key } = payload;
            if (!key) throw new Error("Noe key found");

            const existing = await this.signedUrlCacheRepository.findSignedUrl({ key });
            if (existing && existing.expiresAt > new Date()) {
                return { success: true, message: "Signed Url", data: existing.key };
            }

            const command = new GetObjectCommand({
                Bucket: awsConfig.aws_s3Bucket_name,
                Key: key,
            });

            const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 172800 });
            const expiresAt = new Date(Date.now() + 172800 * 1000);

            await this.signedUrlCacheRepository.updateSignedUrl({
                expiresAt,
                key,
                url: signedUrl
            });

            return { success: true, message: "Signed Url", data: signedUrl };

        } catch (error) {
            console.log("CreateFileSignedUrlUseCase error : ", error);
            throw new Error("Failed to create signed url");
        }
    }
}

export class DeleteFileFromS3UseCase {
    constructor(
        private s3Client: S3Client
    ) { }

    async execute(key: string): Promise<boolean> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: awsConfig.aws_s3Bucket_name,
                Key: key,
            });
            const res = await this.s3Client.send(command);
            if (res.$metadata.httpStatusCode === 200) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log("DeleteFileFromS3UseCase error : ", error);
            throw new Error("Failed to delete file");
        }
    }
};