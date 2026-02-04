import { randomUUID } from "crypto";
import { awsConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { CreareFileUploadPresignedUrlRequest, CreareFileUploadPresignedUrlResponse, CreateFileSignedUrlRequest } from "../../dtos/common.dto";

export class CreateFileUploadPresignedUrlUseCase {
    constructor(
        private s3Client: S3Client
    ) { };

    async execute(data: CreareFileUploadPresignedUrlRequest): Promise<CreareFileUploadPresignedUrlResponse> {
        try {
            const { fileName, fileType, folderName } = data;

            if (!fileName || !fileType || !folderName) throw new Error("Invalid request");

            const ext = fileName.split(".").pop();
            if (!ext) throw new Error("Invalid file name");

            const key = `${folderName}/${Date.now()}-${randomUUID()}.${ext}`;

            const command = new PutObjectCommand({
                Bucket: awsConfig.awsS3BucketName,
                Key: key,
                ContentType: fileType,
            });

            const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 300 });

            return {
                key,
                uploadUrl
            };
        } catch (error) {
            log.error("CreateFileUploadPresignedUrlUseCase failed", error as Error);
            throw error;
        };
    };
};

export class CreateFileSignedUrlUseCase {
    constructor(
        private signedUrlService: ISignedUrlService,
    ) { };

    async execute(payload: CreateFileSignedUrlRequest): Promise<string> {
        try {
            const { key } = payload;
            if (!key) throw new Error("Noe key found");

            const signedUrl = await this.signedUrlService.get(key);
            if (!signedUrl) throw new Error("Failed to generate signed url");

            return signedUrl;
        } catch (error) {
            log.error("CreateFileSignedUrlUseCase failed", error as Error);
            throw error;
        };
    };
};

export class DeleteFileFromS3UseCase {
    constructor(
        private s3Client: S3Client,
        private signedUrlService: ISignedUrlService
    ) { };

    async execute(key: string): Promise<boolean> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: awsConfig.awsS3BucketName,
                Key: key,
            });
            const res = await this.s3Client.send(command);
            if (res.$metadata.httpStatusCode === 200) {
                await this.signedUrlService.delete(key);
                return true;
            } else {
                return false;
            };
        } catch (error) {
            log.error("DeleteFileFromS3UseCase failed", error as Error);
            throw error;
        };
    };
};