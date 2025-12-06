import { Types } from "mongoose";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IAddressRepository } from "../../../domain/interfaces/repositories/IAddress.repository";
import { UserFetchAddressResponse, UserFetchUserAddressRequest } from "../../../infrastructure/dtos/user.dto";
import { ApiResponse, CreateAddressRequest, UpdateAddressRequest } from "../../../infrastructure/dtos/common.dto";

export class UserFetchAddressUseCase {
    constructor(
        private userRepository: IUserRepository,
        private addressRepository: IAddressRepository,
    ) { }

    async execute(payload: UserFetchUserAddressRequest): Promise<ApiResponse<UserFetchAddressResponse>> {
        try {
            const { userId } = payload;

            const user = await this.userRepository.findUserById(userId);
            if (!user) throw new Error("No user found.");
            const address = await this.addressRepository.findAddressByUserId(userId);
            if (address === null) return { success: true, message: "User Address not yet addedd.", data: {} }
            if (!address) throw new Error("Address fetching error.");
            const { userId: uId, createdAt, updatedAt, ...rest } = address;
            return { success: true, message: "User address fetched.", data: rest }
        } catch (error) {
            console.log("UserFetchAddressUseCase error : ", error);
            throw new Error("Failed to fetch address");
        }
    }
}


export class UserCreateAddressUseCase {
    constructor(
        private userRepository: IUserRepository,
        private addressRepository: IAddressRepository,
    ) { }

    async execute(payload: CreateAddressRequest): Promise<ApiResponse> {
        try {
            const { userId, addressLine, landMark, phone, place, city, district, pincode, state, country, location } = payload;

            const user = await this.userRepository.findUserById(userId);
            if (!user) throw new Error("Please logout and try again.");

            const address = await this.addressRepository.createAddress({ userId: new Types.ObjectId(userId), addressLine, landMark, phone, place, city, district, pincode, state, country, location });
            if (!address) throw new Error("Address adding error.");

            if (user && address && address._id) {
                user.addressId = address._id;
                const updatedUser = await this.userRepository.updateUser(user);
                if (!updatedUser) throw new Error("Failed to update user with address.");
            }

            return { success: true, message: "Address added successfully" };
        } catch (error) {
            console.log("UserCreateAddressUseCase error : ", error);
            throw new Error("Failed too create address");
        }
    }
}

export class UserUpdateAddressUseCase {
    constructor(
        private addressRepository: IAddressRepository,
    ) { }

    async execute(payload: UpdateAddressRequest): Promise<ApiResponse<UserFetchAddressResponse>> {
        try {
            const { _id: addressId, userId, addressLine, landMark, phone, place, city, district, pincode, state, country, location } = payload;

            const existingAddress = await this.addressRepository.findAddressById(addressId);
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

            const updatedAddress = await this.addressRepository.updateAddress(existingAddress);
            if (!updatedAddress) throw new Error("Address updating failed.");

            const { userId: user_Id, createdAt, ...rest } = updatedAddress;
            return { success: true, message: "Address updated successfully", data: rest };
        } catch (error) {
            console.log("UserUpdateAddressUseCase error : ", error);
            throw new Error("Failed to update address");
        }
    }
}