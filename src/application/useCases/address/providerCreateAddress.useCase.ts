import { log } from "../../../shared/logger/logger";
import { CreateAddressRequest } from "../../dtos/address.dto";
import { Address } from "../../../domain/entities/address.entity";
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