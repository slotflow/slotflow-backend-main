import mongoose from "mongoose";
import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { CreateProviderServiceInput } from "../../dtos/providerService.dto";
import { ProviderService } from "../../../domain/entities/providerService.entity";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";
import { IProviderServiceRepository } from "../../../domain/interfaces/repositories/IProviderService.repository";

export class CreateProviderServiceUseCase {

    constructor(
        private providerProfileRepository: IProviderProfileRepository,
        private providerServiceRepository: IProviderServiceRepository,
    ) { };

    async execute(input: CreateProviderServiceInput): Promise<void> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { providerId } = input;
            if (!providerId) {
                throw new BadRequestError(
                    "Invalid Request",
                    ERROR_CODES.INVALID_REQUEST
                )
            }

            const providerProfile = await this.providerProfileRepository.findByUserId(providerId);
            if (!providerProfile) {
                throw new NotFoundError(
                    "Profile not found.",
                    ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND
                )
            }

            const providerService = ProviderService.create({ ...input });

            const newSerivce = await this.providerServiceRepository.create(providerService, session);

            if (providerProfile && newSerivce) {
                providerProfile.attachService(newSerivce._id);
                const updatedProviderProfile = await this.providerProfileRepository.update(providerProfile, session);
                if (!updatedProviderProfile) {
                    throw new AppError(
                        "Failed to update provider with service.",
                        500,
                        false,
                        ERROR_CODES.PROVIDER_PROFILE_UPDATE_FAILED
                    )
                };
            };
            await session.commitTransaction();
        } catch (error: unknown) {
            await session.abortTransaction();
            throw toAppError(error, "Failed to create provider service");
        } finally {
            session.endSession()
        }
    };
};