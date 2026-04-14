import { log } from "../../../shared/logger/logger";
import { CreateAddressInput } from "../../dtos/address.dto";
import { Address } from "../../../domain/entities/address.entity";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IAddressRepository } from "../../../domain/interfaces/repositories/IAddress.repository";

export class UserCreateAddressUseCase {
    constructor(
        private userRepository: IUserRepository,
        private addressRepository: IAddressRepository,
    ) { };

    async execute(input: CreateAddressInput): Promise<void> {
        try {
            const user = await this.userRepository.findById(input.userId);
            if (!user) throw new Error("Please logout and try again");

            const address = Address.create({ ...input });

            const savedAddress = await this.addressRepository.create(address);
            if (!savedAddress) throw new Error("Failed to save address");

            user.attachAddress(savedAddress._id)
            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) throw new Error("Failed to update user with address");
        } catch (error) {
            log.error("UserCreateAddressUseCase failed", error as Error);
            throw error;
        };
    };
};