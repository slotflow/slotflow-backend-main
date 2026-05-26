import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";
import { ChangeServiceBlockStatusInput, ChangeServiceBlockStatusOutput } from "../../dtos/service.dto";

export class ChangeServiceBlockStatusUseCase {
    constructor(
        private readonly seriveRepository: IServiceRepository
    ) { };

    async execute(input: ChangeServiceBlockStatusInput): Promise<ChangeServiceBlockStatusOutput> {
        try {
            const { serviceId, isBlocked } = input;
            if (!serviceId) {
                throw new BadRequestError();
            }

            const service = await this.seriveRepository.findById(serviceId);
            if (!service) {
                throw new NotFoundError(
                    "Service not found.",
                    ERROR_CODES.SERVICE_NOT_FOUND
                );
            }

            if (service.isBlocked !== isBlocked) {
                isBlocked ? service.block() : service.unblock();
            };

            const updatedService = await this.seriveRepository.update(service);
            if (!updatedService) {
                throw new AppError(
                    "Service status changing error.",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            return { serviceId, isBlocked: updatedService.isBlocked };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to change service block status");
        };
    };
};