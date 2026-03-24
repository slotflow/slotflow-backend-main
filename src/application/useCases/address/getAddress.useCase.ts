import { log } from "../../../shared/logger/logger";
import { GetAddressRequest, GetAddressResponse } from "../../dtos/address.dto";
import { AddressRepositoryImpl } from "../../../infrastructure/repositoryImpls/address.repository.impl";

export class GetAddressUseCase {
    constructor(
        private readonly addressRepository: AddressRepositoryImpl
    ) { }

    async execute(payload: GetAddressRequest): Promise<GetAddressResponse> {
        try {
            const { userId, isMyAddress } = payload;
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
        } catch (error) {
            log.error("getAddressUseCase failed : ", error as Error);
            throw error;
        }
    }
}