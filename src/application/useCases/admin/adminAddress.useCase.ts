import { ApiResponse } from "../../dtos/common.dto";
import { AdminFetchUserOrProviderAddressResponse } from "../../dtos/admin.dto";
import { IAddressRepository } from "../../../domain/interfaces/repositories/IAddress.repository";

export class AdminFetchUserOrProviderAddressUseCase {
    constructor(
        private addressRepository: IAddressRepository
    ) { }

    async execute(userOrProviderId: string): Promise<ApiResponse<AdminFetchUserOrProviderAddressResponse>> {
        try {

            const addressData = await this.addressRepository.findByUserId(userOrProviderId);
            if (addressData == null) return { success: true, message: "Address not yet added.", data: {} };

            const { id, ...address } = addressData;
            return { success: true, message: "Address fetched successfully.", data: address };

        } catch (error) {
            console.log("AdminFetchUserOrProviderAddressUseCase : ", error);
            throw new Error("Failed to fetch users / provider address");
        }
    }
}