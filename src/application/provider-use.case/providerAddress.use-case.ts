import {
    ProviderFetchAddressRequest,
    ProviderFetchAddressResponse,
} from "../../infrastructure/dtos/provider.dto";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { CreateAddressRequest, ApiResponse, UpdateAddressRequest } from "../../infrastructure/dtos/common.dto";


export class ProviderCreateAddressUseCase {
    constructor(
        private providerRepositoryImpl: ProviderRepositoryImpl,
        private addressRepositoryImpl: AddressRepositoryImpl,
    ) { }

    async execute(payload: CreateAddressRequest): Promise<ApiResponse> {
        try {
            const { userId, addressLine, landMark, phone, place, city, district, pincode, state, country, location } = payload;

            const provider = await this.providerRepositoryImpl.findProviderById(userId);
            if (!provider) throw new Error("Please logout and try again.");

            const address = await this.addressRepositoryImpl.createAddress({ userId: userId, addressLine, landMark, phone, place, city, district, pincode, state, country, location });
            if (!address) throw new Error("Address adding error.");

            if (provider && address && address._id) {
                provider.addressId = address._id;
                const updatedProvider = await this.providerRepositoryImpl.updateProvider(provider);
                if (!updatedProvider) throw new Error("Failed to update provider with address.");
            }

            return { success: true, message: "Address added successfully" };
        } catch (error) {
            console.log("ProviderCreateAddressUseCase error : ", error);
            throw new Error("Failed to create address");
        }
    }
}


export class ProviderFetchAddressUseCase {
    constructor(private addressRepositoryImpl: AddressRepositoryImpl) { }

    async execute(payload: ProviderFetchAddressRequest): Promise<ApiResponse<ProviderFetchAddressResponse>> {
        try {
            const { providerId } = payload;

            if (!providerId) throw new Error("Invalid request.");
            const address = await this.addressRepositoryImpl.findAddressByUserId(providerId);
            if (address === null) return { success: true, message: "Provider address not yet addedd.", data: {} };
            if (!address) throw new Error("Provider address fetching error.");
            const { userId, createdAt, ...rest } = address;
            return { success: true, message: "Provider address fetched.", data: rest };
        } catch (error) {
            console.log("ProviderFetchAddressUseCase error : ", error);
            throw new Error("Failed to fetch address");
        }
    }
}


export class ProviderUpdateAddressUseCase {
    constructor(
        private addressRepositoryImpl: AddressRepositoryImpl,
    ) { }

    async execute(payload: UpdateAddressRequest): Promise<ApiResponse<ProviderFetchAddressResponse>> {
        try {
            const { _id: addressId, userId, addressLine, landMark, phone, place, city, district, pincode, state, country, location } = payload;

            const existingAddress = await this.addressRepositoryImpl.findAddressById(addressId);
            if (!existingAddress) throw new Error("Address not found");

            existingAddress.addressLine = addressLine || existingAddress.addressLine;
            existingAddress.landMark = landMark || existingAddress.landMark;
            existingAddress.phone = phone || existingAddress.phone;
            existingAddress.place = place || existingAddress.place;
            existingAddress.city = city || existingAddress.city;
            existingAddress.district = district || existingAddress.district;
            existingAddress.pincode = pincode || existingAddress.pincode;
            existingAddress.state = state || existingAddress.state;
            existingAddress.country = country || existingAddress.country;
            existingAddress.location = location || existingAddress.location;

            const updatedAddress = await this.addressRepositoryImpl.updateAddress(existingAddress);
            if (!updatedAddress) throw new Error("Address updating failed.");

            const { userId: providerId, createdAt, ...rest } = updatedAddress;
            return { success: true, message: "Address updated successfully", data: rest };
        } catch (error) {
            console.log("ProviderUpdateAddressUseCase error : ", error);
            throw new Error("Address updating failed");
        }
    }
}