import { log } from "../../../shared/logger/logger";
import { GetAddressInput, GetAddressOutput } from "../../dtos/address.dto";
import { AddressRepositoryImpl } from "../../../infrastructure/repositoryImpls/address.repository.impl";

export class GetAddressUseCase {
    constructor(
        private readonly addressRepository: AddressRepositoryImpl
    ) { }

    async execute(input: GetAddressInput): Promise<GetAddressOutput> {
        try {
            const { userId, isMyAddress } = input;
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