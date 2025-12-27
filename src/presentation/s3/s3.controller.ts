import { log } from "../../shared/logger/logger";
import { redis } from "../../infrastructure/lib/redis";
import { NextFunction, Request, Response } from "express";
import { s3Client } from "../../infrastructure/lib/aws_s3";
import { sendResponse } from "../../shared/utils/response";
import { ISignedUrlService } from "../../domain/interfaces/services/ISignedUrl.service";
import { PresignedUrlZodSchema, s3FileKeyZodSchmema } from "../../shared/zod/common.zod";
import { SignedUrlServiceImpl } from "../../infrastructure/services/signedUrlService.impl";
import { CreateFileSignedUrlUseCase, CreateFileUploadPresignedUrlUseCase } from "../../application/useCases/common/s3.useCase";

const createFileUploadPresignedUrlUseCase = new CreateFileUploadPresignedUrlUseCase(s3Client);

const signedUrlService: ISignedUrlService = new SignedUrlServiceImpl(redis, s3Client);

const createFileSignedUrlUseCase = new CreateFileSignedUrlUseCase(signedUrlService);

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