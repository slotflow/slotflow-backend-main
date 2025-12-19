import { Address } from "../../../domain/entities/address.entity";
import { CreateAddressRequest, UpdateAddressRequest } from "../../dtos/common.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { UserFetchAddressResponse, UserFetchUserAddressRequest } from "../../dtos/user.dto";
import { IAddressRepository } from "../../../domain/interfaces/repositories/IAddress.repository";

export class UserCreateAddressUseCase {
    constructor(
        private userRepository: IUserRepository,
        private addressRepository: IAddressRepository,
    ) { }

    async execute(payload: CreateAddressRequest): Promise<void> {
        try {
            const { userId, addressLine, landMark, phone, place, city, district, pincode, state, country, location } = payload;

            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("Please logout and try again");

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
            );

            const savedAddress = await this.addressRepository.create(address);
            if (!savedAddress) throw new Error("Failed to save address");

            user.updateAddressId(savedAddress._id)
            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) throw new Error("Failed to update user with address");

        } catch (error) {
            console.log("UserCreateAddressUseCase error : ", error);
            throw new Error("Failed too create address");
        }
    }
}

export class UserFetchAddressUseCase {
    constructor(
        private userRepository: IUserRepository,
        private addressRepository: IAddressRepository,
    ) { }

    async execute(payload: UserFetchUserAddressRequest): Promise<UserFetchAddressResponse> {
        try {

            const { userId } = payload;
            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("No user found.");

            const address = await this.addressRepository.findByUserId(userId);
            if(!address) return null;

            const { userId: uId, createdAt, updatedAt, ...rest } = address;
            return rest;

        } catch (error) {
            console.log("UserFetchAddressUseCase error : ", error);
            throw new Error("Failed to fetch address");
        }
    }
}


export class UserUpdateAddressUseCase {
    constructor(
        private addressRepository: IAddressRepository,
    ) { }

    async execute(payload: UpdateAddressRequest): Promise<UserFetchAddressResponse> {
        try {

            const { _id: addressId, addressLine, landMark, phone, place, city, district, pincode, state, country, location } = payload;

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
            existingAddress.updatedAt = new Date();

            const updatedAddress = await this.addressRepository.update(existingAddress);
            if (!updatedAddress) throw new Error("Address updating failed.");

            const { userId: user_Id, createdAt, ...rest } = updatedAddress;
            return rest;
        } catch (error) {
            console.log("UserUpdateAddressUseCase error : ", error);
            throw new Error("Failed to update address");
        }
    }
}