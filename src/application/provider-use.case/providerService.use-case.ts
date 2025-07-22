import { Types } from 'mongoose';
import { awsConfig } from '../../config/env';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from "@aws-sdk/lib-storage";
import { ApiResponse } from '../../infrastructure/dtos/common.dto';
import { Validator } from '../../infrastructure/validator/validator';
import { generateS3Key } from '../../infrastructure/helpers/generateS3Key';
import { generateSignedUrl } from '../../infrastructure/services/signedUrl.service';
import { ProviderRepositoryImpl } from '../../infrastructure/database/provider/provider.repository.impl';
import { ProviderServiceRepositoryImpl } from '../../infrastructure/database/providerService/providerService.repository.impl';
import { ProviderAddServiceDetailsRequest, ProviderFetchProviderServiceRequest, ProviderFetchProviderServiceResponse, ProviderFindProviderServiceResProps } from '../../infrastructure/dtos/provider.dto';


export class ProviderAddServiceDetailsUseCase {

    constructor(
        private providerRepositoryImpl: ProviderRepositoryImpl,
        private providerServiceRepositoryImpl: ProviderServiceRepositoryImpl,
        private s3: S3Client
    ) { }

    async execute(payload: ProviderAddServiceDetailsRequest): Promise<ApiResponse> {

        const { providerId, serviceCategory, serviceName, serviceDescription, servicePrice, providerAdhaar, providerExperience, file } = payload;
        if (!providerId || !serviceCategory || !serviceName || !serviceDescription || !servicePrice || !providerAdhaar || !providerExperience || !file) throw new Error("Invalid Request.");

        Validator.validateObjectId(providerId, "providerId");
        Validator.validateObjectId(serviceCategory, "serviceCategoryId");
        Validator.validateServiceName(serviceName);
        Validator.validateServiceDescription(serviceDescription);
        Validator.validateServicePrice(servicePrice);
        Validator.validateProviderAdhaar(String(providerAdhaar));
        Validator.validateProviderExperience(providerExperience);
        Validator.validateFile(file);

        const provider = await this.providerRepositoryImpl.findProviderById(providerId);
        if (!provider) throw new Error("Please logout and try again.");

        try {
            const params = {
                Bucket: awsConfig.aws_s3Bucket_name as string,
                Key: generateS3Key({
                    folder: "slotflow-provider-certificate",
                    userId: providerId,
                    originalname: file.originalname,
                }),
                Body: file.buffer,
                ContentType: file.mimetype,
            };

            const upload = new Upload({
                client: this.s3,
                params: params,
            });

            const s3UploadResponse = await upload.done();
            if (!s3UploadResponse) throw new Error("Image uploading error, please try again");

            const providerService = await this.providerServiceRepositoryImpl.createProviderService({ providerId, serviceCategory, serviceName, serviceDescription, servicePrice, providerAdhaar, providerExperience, providerCertificateUrl: s3UploadResponse.Location! })
            if (!providerService) throw new Error("Service details adding error.");

            if (provider && providerService && providerService._id) {
                provider.serviceId = providerService._id;
                const updatedProvider = await this.providerRepositoryImpl.updateProvider(provider);
                if (!updatedProvider) throw new Error("Failed to update provider with service ID.");
            }

            return { success: true, message: 'Service details saved.' };

        } catch (error) {
            throw new Error('Failed to save service details.')
        }
    }
}


export class ProviderFetchServiceDetailsUseCase {

    constructor(private provderServiceRepositoryImpl: ProviderServiceRepositoryImpl) { }

    async execute({ providerId }: ProviderFetchProviderServiceRequest): Promise<ApiResponse<ProviderFetchProviderServiceResponse>> {

        if (!providerId) throw new Error("Invalid request.");
        Validator.validateObjectId(providerId, "providerId");

        const service = await this.provderServiceRepositoryImpl.findProviderServiceByProviderId(new Types.ObjectId(providerId));
        if (service === null) return { success: true, message: "Provider service details not yet addedd", data: {} };
        function isServiceData(obj: any): obj is ProviderFindProviderServiceResProps {
            return obj && typeof obj === 'object' && '_id' in obj;
        }

        if (!isServiceData(service)) {
            return { success: true, message: "Service fetched successfully.", data: {} };
        }

        const signedUrl = await generateSignedUrl(service.providerCertificateUrl);
        service.providerCertificateUrl = signedUrl;

        const { createdAt, updatedAt, ...rest } = service;

        return { success: true, message: "Provider service details fetched", data: rest };
    }
}