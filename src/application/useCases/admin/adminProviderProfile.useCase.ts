import {
    AdminFetchProviderServiceRequest,
    AdminFetchProviderServiceResponse,
} from "../../dtos/admin.dto";
import { log } from "../../../shared/logger/logger";
import { IProviderServiceQueries } from "../../queries/IProviderService.queries";

export class AdminFetchProviderServiceUseCase {
    constructor(
        private providerServiceQueries: IProviderServiceQueries,
    ) { };

    async execute(payload: AdminFetchProviderServiceRequest): Promise<AdminFetchProviderServiceResponse> {
        try {
            const { providerId } = payload;

            const service = await this.providerServiceQueries.findByProviderId(providerId);
            if (!service) return null;

            return {...service};
        } catch (error) {
            log.error("AdminFetchProviderServiceUseCase failed", error as Error);
            throw error;
        };
    };
};