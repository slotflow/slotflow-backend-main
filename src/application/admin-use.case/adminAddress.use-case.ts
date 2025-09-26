import { Types } from "mongoose";
import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { Validator } from "../../infrastructure/validator/validator";
import { AdminFetchUserOrProviderAddressResponse } from "../../infrastructure/dtos/admin.dto";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";

export class AdminFetchUserOrProviderAddressUseCase {
    constructor(
        private addressRepository: AddressRepositoryImpl,) { }

    async execute(userOrProviderId: Types.ObjectId): Promise<ApiResponse<AdminFetchUserOrProviderAddressResponse>> {

        if (!userOrProviderId) throw new Error("Invalid request.");

        Validator.validateObjectId(userOrProviderId, "id");

        const addressData = await this.addressRepository.findAddressByUserId(userOrProviderId);
        if (addressData == null) return { success: true, message: "Address not yet added.", data: {} };

        const { _id, ...address } = addressData;
        return { success: true, message: "Address fetched successfully.", data: address };
    }
}