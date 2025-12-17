import { AdminFetchUserOrProviderAddressResponse } from "../../dtos/admin.dto";
import { IAddressRepository } from "../../../domain/interfaces/repositories/IAddress.repository";

export class AdminFetchUserOrProviderAddressUseCase {
    constructor(
        private addressRepository: IAddressRepository
    ) { }

    async execute(userOrProviderId: string): Promise<AdminFetchUserOrProviderAddressResponse> {
        try {

            const address = await this.addressRepository.findByUserId(userOrProviderId);
            if(!address) return null;

            const { _id, ...rest } = address;
            return rest;

        } catch (error) {
            console.log("AdminFetchUserOrProviderAddressUseCase : ", error);
            throw new Error("Failed to fetch users / provider address");
        }
    }
}