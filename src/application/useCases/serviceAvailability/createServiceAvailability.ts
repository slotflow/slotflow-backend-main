import mongoose from "mongoose";
import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { CreateServiceAvailabilityInput } from "../../dtos/serviceAvailability.dto";
import { ServiceAvailability } from "../../../domain/entities/serviceAvailability.entity";
import { FrontendAvailabilityForClientInput, FrontendAvailabilityUpdatedSlots } from "../../dtos/common.dto";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";
import { IServiceAvailabilityRepository } from "../../../domain/interfaces/repositories/IServiceAvailability.repository";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";

export class CreateServiceAvailabilitiesUseCase {
    constructor(
        private providerProfileRepository: IProviderProfileRepository,
        private serviceAvailabilityRepository: IServiceAvailabilityRepository,
    ) { };

    async execute(input: CreateServiceAvailabilityInput): Promise<void> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { providerId, availabilities } = input;
            if (!providerId || !availabilities || availabilities.length === 0) {
                throw new BadRequestError();
            }

            const providerProfile = await this.providerProfileRepository.findById(providerId);
            if (!providerProfile) {
                throw new NotFoundError(
                    "Profile not found.",
                    ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND
                );
            }

            const newAvailabilities: FrontendAvailabilityUpdatedSlots[] = availabilities.map((availability: FrontendAvailabilityForClientInput) => ({
                ...availability,
                slots: availability.slots.map((slot: string) => ({
                    time: slot
                }))
            }));

            const serviceAvailabilityData = ServiceAvailability.create({
                providerId,
                availabilities: newAvailabilities
            });

            const serviceAvailability = await this.serviceAvailabilityRepository.create(serviceAvailabilityData, session);
            if (!serviceAvailability) {
                throw new AppError(
                    "Service availability saving failed.",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            if (providerProfile && serviceAvailability && serviceAvailability._id) {
                providerProfile.attachServiceAvailability(serviceAvailability._id);
                const updatedProviderProfile = await this.providerProfileRepository.update(providerProfile, session);
                if (!updatedProviderProfile) {
                    throw new AppError(
                        "Failed to update service availability in profile.",
                        500,
                        true,
                        ERROR_CODES.INTERNAL_ERROR
                    );
                }
            };
            session.commitTransaction();
        } catch (error: unknown) {
            await session.abortTransaction();
            throw toAppError(error, "Failed to create service availability");
        } finally {
            session.endSession()
        }
    };
};