import { 
    ProviderFetchAddressRequest, 
    ProviderFetchAddressResponse, 
} from "../../infrastructure/dtos/provider.dto";
import { Validator } from "../../infrastructure/validator/validator";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { AddAddressRequest, ApiResponse, UpdateAddressRequest } from "../../infrastructure/dtos/common.dto";


export class ProviderAddAddressUseCase {
    constructor(
        private providerRepositoryImpl: ProviderRepositoryImpl, 
        private addressRepositoryImpl: AddressRepositoryImpl,
    ){}

    async execute(payload: AddAddressRequest): Promise<ApiResponse> {
        
        const { userId, addressLine, phone, place, city, district, pincode, state, country, googleMapLink } = payload;
        if(!userId || !addressLine || !phone || !place || !city || !district || !pincode || !state || !country || !googleMapLink) throw new Error("Invalid request.");

        Validator.validateObjectId(userId,"providerId");
        Validator.validateAddressLine(addressLine);
        Validator.validatePhone(phone);
        Validator.validatePlace(place);
        Validator.validateCity(city);
        Validator.validateDistrict(district);
        Validator.validatePincode(pincode);
        Validator.validateState(state);
        Validator.validateCountry(country);
        Validator.validateGoogleMapLink(googleMapLink);

        const provider = await this.providerRepositoryImpl.findProviderById(userId);
        if(!provider) throw new Error("Please logout and try again.");

        const address = await this.addressRepositoryImpl.createAddress({userId: userId, addressLine, phone, place, city, district, pincode, state, country, googleMapLink});
        if(!address) throw new Error("Address adding error.");

        if (provider && address && address._id) {
            provider.addressId = address._id;
            const updatedProvider = await this.providerRepositoryImpl.updateProvider(provider);
            if (!updatedProvider) throw new Error("Failed to update provider with address.");
        }

        return {success: true, message: "Address added successfully" };
    }
}


export class ProviderFetchAddressUseCase {
    constructor(private addressRepositoryImpl: AddressRepositoryImpl) { }

    async execute({ providerId }: ProviderFetchAddressRequest): Promise<ApiResponse<ProviderFetchAddressResponse>> {

        Validator.validateObjectId(providerId, "providerId");
        
        if (!providerId) throw new Error("Invalid request.");
        const address = await this.addressRepositoryImpl.findAddressByUserId(providerId);
        if(address === null) return { success: true, message: "Provider address not yet addedd.", data: {} };
        if (!address) throw new Error("Provider address fetching error.");
        const { userId, createdAt, ...rest } = address;
        return { success: true, message: "Provider address fetched.", data: rest };
    }
}


export class ProviderUpdateAddressUseCase {
    constructor(
        private addressRepositoryImpl: AddressRepositoryImpl,
    ){}

    async execute(payload: UpdateAddressRequest): Promise<ApiResponse<ProviderFetchAddressResponse>> {
        try {
            console.log("payload : ",payload);
            const { _id: addressId ,userId, addressLine, phone, place, city, district, pincode, state, country, googleMapLink } = payload;
            if(!userId || !addressLine || !phone || !place || !city || !district || !pincode || !state || !country || !googleMapLink) throw new Error("Invalid request.");
            
            Validator.validateObjectId(userId,"providerId");
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
            console.log("existingAddress : ",existingAddress);
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
            
            const { userId: providerId, createdAt, ...rest } = updatedAddress;
            return {success: true, message: "Address updated successfully", data: rest };
        } catch (error) {
            console.log("ProviderUpdateAddressUseCase error : ",error);
            throw new Error("Address updating failed");
        }
    }
}