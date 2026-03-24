import {
    ProviderFetchAddressRequest,
    ProviderFetchAddressResponse,
} from "../../dtos/provider.dto";
import { log } from "../../../shared/logger/logger";
import { Address } from "../../../domain/entities/address.entity";
import { CreateAddressRequest, UpdateAddressRequest } from "../../dtos/common.dto";
import { IAddressRepository } from "../../../domain/interfaces/repositories/IAddress.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";

export class ProviderCreateAddressUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private addressRepository: IAddressRepository,
    ) { };

    async execute(payload: CreateAddressRequest): Promise<void> {
        try {

            const { userId, addressLine, landMark, phone, place, city, district, pincode, state, country, location } = payload;

            const provider = await this.providerRepository.findById(userId);
            if (!provider) throw new Error("Please logout and try again.");

            const address = Address.create({
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
            });

            const savedAddress = await this.addressRepository.create(address);
            if (!savedAddress) throw new Error("Failed to save address.");

            provider.attachAddress(savedAddress._id);

            const updatedProvider = await this.providerRepository.update(provider);
            if (!updatedProvider) throw new Error("Failed to update provider with address.");

        } catch (error) {
            log.error("ProviderCreateAddressUseCase failed", error as Error);
            throw error;
        };
    };
};


// export class ProviderFetchAddressUseCase {
//     constructor(
//         private addressRepository: IAddressRepository
//     ) { };

//     async execute(payload: ProviderFetchAddressRequest): Promise<ProviderFetchAddressResponse> {
//         try {

//             const { providerId } = payload;
//             if (!providerId) throw new Error("Invalid request.");

//             const address = await this.addressRepository.findByUserId(providerId);
//             if (!address) return null;

//             return {
//                 _id: address._id,
//                 addressLine: address.addressLine,
//                 landMark: address.landMark,
//                 phone: address.phone,
//                 place: address.place,
//                 city: address.city,
//                 district: address.district,
//                 pincode: address.pincode,
//                 state: address.state,
//                 country: address.country,
//                 location: address.location,
//             };

//         } catch (error) {
//             log.error("ProviderFetchAddressUseCase failed", error as Error);
//             throw error;
//         };
//     };
// };


export class ProviderUpdateAddressUseCase {
    constructor(
        private addressRepository: IAddressRepository,
    ) { };

    async execute(payload: UpdateAddressRequest): Promise<ProviderFetchAddressResponse> {
        try {

            const { _id: addressId, ...updateData } = payload;

            const address = await this.addressRepository.findById(addressId);
            if (!address) throw new Error("Address not found");

            address.updateAddress(updateData);

            const updatedAddress = await this.addressRepository.update(address);
            if (!updatedAddress) throw new Error("Address updating failed.");

            return {
                _id: updatedAddress._id,
                addressLine: updatedAddress.addressLine,
                landMark: updatedAddress.landMark,
                phone: updatedAddress.phone,
                place: updatedAddress.place,
                city: updatedAddress.city,
                district: updatedAddress.district,
                pincode: updatedAddress.pincode,
                state: updatedAddress.state,
                country: updatedAddress.country,
                location: updatedAddress.location,
            };
        } catch (error) {
            log.error("ProviderUpdateAddressUseCase failed", error as Error);
            throw error;
        };
    };
};