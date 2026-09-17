import { CreateServicesInput } from "../../dtos/service.dto";
import { Service } from "../../../domain/entities/service.entity";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, BadRequestError } from "../../../shared/error/appError";
import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";

export class CreateServicesUseCase {
    constructor(
        private serviceRepository: IServiceRepository
    ) { }

    async execute(input: CreateServicesInput): Promise<void> {
        try {
            const { serviceCategory, serviceNames } = input;
            if (!serviceCategory || !serviceNames?.length) {
                throw new BadRequestError();
            }

            const normalizedNames = serviceNames.map((serviceName ) => serviceName.trim()).filter(Boolean);

            if (!normalizedNames.length) {
                throw new BadRequestError();
            }

            const uniqueNames = [...new Set(normalizedNames)];

            const services = uniqueNames.map((serviceName) =>
                Service.create({
                    serviceCategory,
                    serviceName,
                })
            );

            await this.serviceRepository.createMany(services);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to create services");
        }
    }
}