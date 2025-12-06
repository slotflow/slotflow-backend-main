import { s3Client } from "../../config/aws_s3";
import { NextFunction, Request, Response } from "express";
import { PresignedUrlZodSchema, s3FileKeyZodSchmema } from "../../shared/zod/common.zod";
import { ISignedUrlCacheRepository } from "../../domain/interfaces/repositories/ISignedUrlCache.repository";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";
import { CreateFileSignedUrlUseCase, CreateFileUploadPresignedUrlUseCase } from "../../application/useCases/common/s3.useCase";

const signedUrlCacheRepository: ISignedUrlCacheRepository = new SignedUrlCacheRepositoryImpl();

const createFileUploadPresignedUrlUseCase = new CreateFileUploadPresignedUrlUseCase(s3Client);
const createFileSignedUrlUseCase = new CreateFileSignedUrlUseCase(s3Client, signedUrlCacheRepository);

export class S3Controller {
    constructor(
        private createFileUploadPresignedUrlUseCase: CreateFileUploadPresignedUrlUseCase,
        private createFileSignedUrlUseCase: CreateFileSignedUrlUseCase
    ) {
        this.getFileUploadPresignedUrl = this.getFileUploadPresignedUrl.bind(this);
        this.getFileSignedUrl = this.getFileSignedUrl.bind(this);
    }

    async getFileUploadPresignedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log("req.query : ",req.query);
            const validatedData = PresignedUrlZodSchema.parse(req.query);
            const result = await this.createFileUploadPresignedUrlUseCase.execute(validatedData);
            res.status(200).json(result);
        } catch (error: any) {
            console.log("getFileUploadPresignedUrl error : ", error);
            next(error);
        }
    };

    async getFileSignedUrl(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = s3FileKeyZodSchmema.parse(req.query);
            const result = await this.createFileSignedUrlUseCase.execute({ key: validatedData.s3FileKey });
            res.status(200).json(result);
        } catch (error) {
            console.log("getFileSignedUrl error : ", error);
            next(error);
        }
    };
}

export const s3Controller = new S3Controller(
    createFileUploadPresignedUrlUseCase,
    createFileSignedUrlUseCase,
);