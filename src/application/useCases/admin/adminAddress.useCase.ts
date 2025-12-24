import { log } from "../../../shared/logger/logger";
import { AdminFetchUserOrProviderAddressResponse } from "../../dtos/admin.dto";
import { IAddressRepository } from "../../../domain/interfaces/repositories/IAddress.repository";

export class AdminFetchUserOrProviderAddressUseCase {
    constructor(
        private addressRepository: IAddressRepository
    ) { }

    async execute({userId}: {userId: string}): Promise<AdminFetchUserOrProviderAddressResponse> {
        try {

            const address = await this.addressRepository.findByUserId(userId);
            if(!address) return null;

            const { _id, ...rest } = address.getProps();
            return rest;

        } catch (error) {
            log.error("AdminFetchUserOrProviderAddressUseCase failed : ", error as Error);
            throw error;
        }
    }
}