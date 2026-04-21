import { ERROR_CODES } from "../../../shared/utils/types";
import { CreateServiceInput } from "../../dtos/service.dto";
import { BadRequestError } from "../../../shared/error/appError";
import { Service } from "../../../domain/entities/service.entity";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";

export class CreateServiceUseCase {
    constructor(
        private seriveRepository: IServiceRepository
    ) { };

    async execute(input: CreateServiceInput): Promise<void> {
        try {
            const { serviceName, serviceCategory } = input;
            if (!serviceName || !serviceCategory) {
                throw new BadRequestError();
            }

            const existService = await this.seriveRepository.findByName(serviceName);
            if (existService) {
                throw new BadRequestError(
                    "Service already exist.",
                    ERROR_CODES.SERVICE_ALREADY_EXIST
                );
            }

            const service = Service.create({
                serviceCategory,
                serviceName
            });

            await this.seriveRepository.create(service);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to create service");
        };
    };
};