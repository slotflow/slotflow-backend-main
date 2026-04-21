import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { UpdateAddressInput, UpdateAddressOutput } from "../../dtos/address.dto";
import { IAddressRepository } from "../../../domain/interfaces/repositories/IAddress.repository";

export class UpdateAddressUseCase {
    constructor(
        private addressRepository: IAddressRepository,
    ) { };

    async execute(input: UpdateAddressInput): Promise<UpdateAddressOutput> {
        try {
            const { _id: addressId, ...updateData } = input;
            if (!addressId || !updateData) {
                throw new BadRequestError(
                    "Invalid request",
                    ERROR_CODES.INVALID_REQUEST
                )
            }

            const address = await this.addressRepository.findById(addressId);
            if (!address) {
                throw new NotFoundError(
                    "Address not found",
                    ERROR_CODES.ADDRESS_NOT_FOUND
                );
            }

            address.updateAddress(updateData);

            const updatedAddress = await this.addressRepository.update(address);
            if (!updatedAddress) {
                throw new AppError(
                    "Failed to update address.",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

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
        } catch (error: unknown) {
            throw toAppError(error, "Failed to update address");
        };
    };
};