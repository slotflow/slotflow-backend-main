import {
    ProviderFetchAddressRequest,
    ProviderFetchAddressResponse,
} from "../../dtos/provider.dto";
import { Address } from "../../../domain/entities/address.entity";
import { ApiResponse, CreateAddressRequest, UpdateAddressRequest } from "../../dtos/common.dto";
import { IAddressRepository } from "../../../domain/interfaces/repositories/IAddress.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";

export class ProviderCreateAddressUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private addressRepository: IAddressRepository,
    ) { }

    async execute(payload: CreateAddressRequest): Promise<ApiResponse> {
        try {
            const { userId, addressLine, landMark, phone, place, city, district, pincode, state, country, location } = payload;

            const provider = await this.providerRepository.findProviderById(userId);
            if (!provider) throw new Error("Please logout and try again.");

            const now = new Date();

            const address = new Address(
                "",
                userId,
                addressLine,
                landMark,
                phone,
                place,
                city,
                district,
                pincode,
                state,
                country,
                location,
                now,
                now
            );

            const savedAddress = await this.addressRepository.create(address);
            if (!savedAddress) throw new Error("Failed to save address.");

            provider.addressId = savedAddress.id;

            const updatedProvider = await this.providerRepository.updateProvider(provider);
            if (!updatedProvider) throw new Error("Failed to update provider with address.");

            return { success: true, message: "Address added successfully" };
        } catch (error) {
            console.log("ProviderCreateAddressUseCase error : ", error);
            throw new Error("Failed to create address");
        }
    }
}


export class ProviderFetchAddressUseCase {
    constructor(
        private addressRepository: IAddressRepository
    ) { }

    async execute(payload: ProviderFetchAddressRequest): Promise<ApiResponse<ProviderFetchAddressResponse>> {
        try {
            const { providerId } = payload;

            if (!providerId) throw new Error("Invalid request.");
            const address = await this.addressRepository.findByUserId(providerId);
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
        private addressRepository: IAddressRepository,
    ) { }

    async execute(payload: UpdateAddressRequest): Promise<ApiResponse<ProviderFetchAddressResponse>> {
        try {
            const { id: addressId, addressLine, landMark, phone, place, city, district, pincode, state, country, location } = payload;

            const existingAddress = await this.addressRepository.findById(addressId);
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

            const updatedAddress = await this.addressRepository.update(existingAddress);
            if (!updatedAddress) throw new Error("Address updating failed.");

            const { userId: providerId, createdAt, ...rest } = updatedAddress;
            return { success: true, message: "Address updated successfully", data: rest };
        } catch (error) {
            console.log("ProviderUpdateAddressUseCase error : ", error);
            throw new Error("Address updating failed");
        }
    }
}