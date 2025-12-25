import { log } from "../../../shared/logger/logger";
import { Address } from "../../../domain/entities/address.entity";
import { CreateAddressRequest, UpdateAddressRequest } from "../../dtos/common.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { UserFetchAddressResponse, UserFetchUserAddressRequest } from "../../dtos/user.dto";
import { IAddressRepository } from "../../../domain/interfaces/repositories/IAddress.repository";

export class UserCreateAddressUseCase {
    constructor(
        private userRepository: IUserRepository,
        private addressRepository: IAddressRepository,
    ) { };

    async execute(payload: CreateAddressRequest): Promise<void> {
        try {
            const user = await this.userRepository.findById(payload.userId);
            if (!user) throw new Error("Please logout and try again");

            const address = Address.create({...payload});

            const savedAddress = await this.addressRepository.create(address);
            if (!savedAddress) throw new Error("Failed to save address");

            user.updateAddressId(savedAddress._id)
            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) throw new Error("Failed to update user with address");
        } catch (error) {
            log.error("UserCreateAddressUseCase failed", error as Error);
            throw error;
        };
    };
};

export class UserFetchAddressUseCase {
    constructor(
        private userRepository: IUserRepository,
        private addressRepository: IAddressRepository,
    ) { };

    async execute(payload: UserFetchUserAddressRequest): Promise<UserFetchAddressResponse> {
        try {
            const { userId } = payload;
            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("No user found.");

            const address = await this.addressRepository.findByUserId(userId);
            if(!address) return null;

            const { userId: uId, createdAt, updatedAt, ...rest } = address.getProps();
            return rest;
        } catch (error) {
            log.error("UserFetchAddressUseCase failed", error as Error);
            throw error;
        };
    };
};


export class UserUpdateAddressUseCase {
    constructor(
        private addressRepository: IAddressRepository,
    ) { };

    async execute(payload: UpdateAddressRequest): Promise<UserFetchAddressResponse> {
        try {
            const { _id: addressId, ...updateData } = payload;

            const address = await this.addressRepository.findById(addressId);
            if (!address) throw new Error("Address not found");

            address.updateAddress(updateData);

            const updatedAddress = await this.addressRepository.update(address);
            if (!updatedAddress) throw new Error("Address updating failed.");

            const { userId: user_Id, createdAt, ...rest } = updatedAddress.getProps();
            return rest;
        } catch (error) {
            log.error("UserUpdateAddressUseCase failed", error as Error);
            throw error;
        };
    };
};