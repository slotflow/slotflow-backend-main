import { Types } from "mongoose";
import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { AdminFetchUserOrProviderAddressResponse } from "../../infrastructure/dtos/admin.dto";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";

export class AdminFetchUserOrProviderAddressUseCase {
    constructor(
        private addressRepository: AddressRepositoryImpl,) { }

    async execute(userOrProviderId: Types.ObjectId): Promise<ApiResponse<AdminFetchUserOrProviderAddressResponse>> {
        try {
            const addressData = await this.addressRepository.findAddressByUserId(userOrProviderId);
            if (addressData == null) return { success: true, message: "Address not yet added.", data: {} };

            const { _id, ...address } = addressData;
            return { success: true, message: "Address fetched successfully.", data: address };
        } catch (error) {
            console.log("AdminFetchUserOrProviderAddressUseCase : ", error);
            throw new Error("Failed to fetch users / provider address");
        }
    }
}