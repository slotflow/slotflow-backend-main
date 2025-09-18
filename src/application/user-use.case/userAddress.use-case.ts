import { Types } from "mongoose";
import { Validator } from "../../infrastructure/validator/validator";
import { AddAddressRequest, ApiResponse, UpdateAddressRequest } from "../../infrastructure/dtos/common.dto";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";
import { 
    UserFetchAddressResponse, 
    UserFetchUserAddressRequest, 
} from "../../infrastructure/dtos/user.dto";


export class UserFetchAddressUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
        private addressRepositoryImpl: AddressRepositoryImpl,
    ) { }

    async execute({userId}: UserFetchUserAddressRequest): Promise<ApiResponse<UserFetchAddressResponse>> {
        if (!userId) throw new Error("Invalid request.");

        Validator.validateObjectId(userId, "userId");

        const user = await this.userRepositoryImpl.findUserById(userId);
        if (!user) throw new Error("No user found.");
        const address = await this.addressRepositoryImpl.findAddressByUserId(userId);
        if (address === null) return { success: true, message: "User Address not yet addedd.", data: {} }
        if (!address) throw new Error("Address fetching error.");
        const { userId: uId, createdAt, updatedAt, ...rest } = address;
        return { success: true, message: "User address fetched.", data: rest }
    }
}


export class UserAddAddressUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
        private addressRepositoryImpl: AddressRepositoryImpl,
    ) { }

    async execute(data: AddAddressRequest): Promise<ApiResponse> {
        const {userId, addressLine, phone, place, city, district, pincode, state, country, googleMapLink} = data;
        if (!userId || !addressLine || !phone || !place || !city || !district || !pincode || !state || !country || !googleMapLink) throw new Error("Invalid request.");
        
        Validator.validateObjectId(userId, "userId");
        Validator.validateAddressLine(addressLine);
        Validator.validatePhone(phone);
        Validator.validatePlace(place);
        Validator.validateCity(city);
        Validator.validateDistrict(district);
        Validator.validatePincode(pincode);
        Validator.validateState(state);
        Validator.validateCountry(country);
        Validator.validateGoogleMapLink(googleMapLink);

        const user = await this.userRepositoryImpl.findUserById(userId);
        if(!user) throw new Error("Please logout and try again.");

        const address = await this.addressRepositoryImpl.createAddress({userId: new Types.ObjectId(userId), addressLine, phone, place, city, district, pincode, state, country, googleMapLink});
        if(!address) throw new Error("Address adding error.");

        if (user && address && address._id) {
            user.addressId = address._id;
            const updatedUser = await this.userRepositoryImpl.updateUser(user);
            if (!updatedUser) throw new Error("Failed to update user with address.");
        }

        return {success: true, message: "Address added successfully" };
    }
}

export class UserUpdateAddressUseCase {
    constructor(
        private addressRepositoryImpl: AddressRepositoryImpl,
    ){}

    async execute(payload: UpdateAddressRequest): Promise<ApiResponse<UserFetchAddressResponse>> {
        try {
            const { _id: addressId ,userId, addressLine, phone, place, city, district, pincode, state, country, googleMapLink } = payload;
            if(!userId || !addressLine || !phone || !place || !city || !district || !pincode || !state || !country || !googleMapLink) throw new Error("Invalid request.");
            
            Validator.validateObjectId(userId,"userId");
            Validator.validateAddressLine(addressLine);
            Validator.validatePhone(phone);
            Validator.validatePlace(place);
            Validator.validateCity(city);
            Validator.validateDistrict(district);
            Validator.validatePincode(pincode);
            Validator.validateState(state);
            Validator.validateCountry(country);
            Validator.validateGoogleMapLink(googleMapLink);
            
            const existingAddress = await this.addressRepositoryImpl.findAddressById(addressId);
            if(!existingAddress) throw new Error("Address not found");

            existingAddress.addressLine = payload.addressLine || existingAddress.addressLine;
            existingAddress.phone = payload.phone || existingAddress.phone;
            existingAddress.place = payload.place || existingAddress.place;
            existingAddress.city = payload.city || existingAddress.city;
            existingAddress.district = payload.district || existingAddress.district;
            existingAddress.pincode = payload.pincode || existingAddress.pincode;
            existingAddress.state = payload.state || existingAddress.state;
            existingAddress.country = payload.country || existingAddress.country;
            existingAddress.googleMapLink = payload.googleMapLink || existingAddress.googleMapLink;
            
            const updatedAddress = await this.addressRepositoryImpl.updateAddress(existingAddress);
            if(!updatedAddress) throw new Error("Address updating failed.");
            
            const { userId: user_Id, createdAt, ...rest } = updatedAddress;
            return {success: true, message: "Address updated successfully", data: rest };
        } catch (error) {
            console.log("UserUpdateAddressUseCase error : ",error);
            throw new Error("Address updating failed");
        }
    }
}