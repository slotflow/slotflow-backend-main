import { awsConfig } from "../../../config/env";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { CreateFileUploadPresignedUrlOutput, CreateFileSignedUrlInput, CreateFileUploadPresignedUrlInput } from "../../dtos/common.dto";
import { generateId } from "../../../shared/utils/generateId";
import { IdType } from "../../../shared/utils/types";

export class CreateFileUploadPresignedUrlUseCase {
    constructor(
        private s3Client: S3Client
    ) { };

    async execute(input: CreateFileUploadPresignedUrlInput): Promise<CreateFileUploadPresignedUrlOutput> {
        try {
            const { fileName, fileType, folderName } = input;
            if (!fileName || !fileType || !folderName) {
                throw new BadRequestError();
            }

            const ext = fileName.split(".").pop();
            if (!ext) throw new BadRequestError();

            const key = `${folderName}/${Date.now()}-${generateId({ type: IdType.FILE })}.${ext}`;

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
        } catch (error: unknown) {
            throw toAppError(error, "Failed to create file upload presigned url");
        };
    };
};

export class CreateFileSignedUrlUseCase {
    constructor(
        private signedUrlService: ISignedUrlService,
    ) { };

    async execute(input: CreateFileSignedUrlInput): Promise<string> {
        try {
            const { key } = input;
            if (!key) {
                throw new BadRequestError();
            }

            const signedUrl = await this.signedUrlService.get(key);

            return signedUrl;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to create file signed url");
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
            if (!key) {
                throw new BadRequestError();
            }

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
        } catch (error: unknown) {
            throw toAppError(error, "Failed to delete file");
        };
    };
};