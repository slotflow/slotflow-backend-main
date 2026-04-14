import { IAddressRepository } from "../../../domain/interfaces/repositories/IAddress.repository";
import { log } from "../../../shared/logger/logger";
import { UpdateAddressInput, UpdateAddressOutput } from "../../dtos/address.dto";

export class UpdateAddressUseCase {
    constructor(
        private addressRepository: IAddressRepository,
    ) { };

    async execute(input: UpdateAddressInput): Promise<UpdateAddressOutput> {
        try {

            const { _id: addressId, ...updateData } = input;

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
            log.error("UpdateAddressUseCase failed", error as Error);
            throw error;
        };
    };
};