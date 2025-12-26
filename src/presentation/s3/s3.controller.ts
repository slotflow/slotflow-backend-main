import { s3Client } from "../../infrastructure/lib/aws_s3";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { PresignedUrlZodSchema, s3FileKeyZodSchmema } from "../../shared/zod/common.zod";
import { CreateFileSignedUrlUseCase, CreateFileUploadPresignedUrlUseCase } from "../../application/useCases/common/s3.useCase";

const createFileUploadPresignedUrlUseCase = new CreateFileUploadPresignedUrlUseCase(s3Client);
const createFileSignedUrlUseCase = new CreateFileSignedUrlUseCase(s3Client);

class S3Controller {
    constructor(
        private createFileUploadPresignedUrlUseCase: CreateFileUploadPresignedUrlUseCase,
        private createFileSignedUrlUseCase: CreateFileSignedUrlUseCase
    ) {
        this.getFileUploadPresignedUrl = this.getFileUploadPresignedUrl.bind(this);
        this.getFileSignedUrl = this.getFileSignedUrl.bind(this);
    };

    async getFileUploadPresignedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = PresignedUrlZodSchema.parse(req.query);
            const result = await this.createFileUploadPresignedUrlUseCase.execute(validatedData);
            sendResponse(res, result);
        } catch (error) {
            log.error("getFileUploadPresignedUrl failed", error as Error);
            next(error);
        };
    };

    async getFileSignedUrl(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = s3FileKeyZodSchmema.parse(req.query);
            const result = await this.createFileSignedUrlUseCase.execute({ key: validatedData.s3FileKey });
            sendResponse(res, result);
        } catch (error) {
            log.error("getFileSignedUrl failed", error as Error);
            next(error);
        };
    };

};

export const s3Controller = new S3Controller(
    createFileUploadPresignedUrlUseCase,
    createFileSignedUrlUseCase,
);