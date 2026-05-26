import { ERROR_CODES } from "../../../shared/utils/types";
import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { GetAddressInput, GetAddressOutput } from "../../dtos/address.dto";
import { AddressRepositoryImpl } from "../../../infrastructure/repositoryImpls/address.repository.impl";

export class GetAddressUseCase {
    constructor(
        private readonly addressRepository: AddressRepositoryImpl
    ) { }

    async execute(input: GetAddressInput): Promise<GetAddressOutput> {
        try {
            const { userId, isMyAddress } = input;
            if(!userId) {
                throw new BadRequestError(
                    "Invalid request",
                    ERROR_CODES.INVALID_REQUEST
                )
            }

            const address = await this.addressRepository.findByUserId(userId);
            if (!address) return null

            return {
                _id: isMyAddress ? address._id : undefined,
                addressLine: address.addressLine,
                phone: address.phone,
                place: address.place,
                city: address.city,
                district: address.district,
                pincode: address.pincode,
                state: address.state,
                country: address.country,
                landMark: address.landMark,
                location: address.location
            }

        } catch (error: unknown) {
            throw toAppError(error, "Failed to fetch address");
        }
    }
}