import { Types } from "mongoose";
import { AddressModel, IAddress } from "./address.model";
import { CreateAddressRequest } from "../../dtos/common.dto";
import { Address } from "../../../domain/entities/address.entity";
import { IAddressRepository } from "../../../domain/repositories/IAddress.repository";

export class AddressRepositoryImpl implements IAddressRepository {
    private mapToEntity(address: IAddress): Address {
            return new Address(
                address._id,
                address.userId,
                address.addressLine,
                address.landMark,
                address.phone,
                address.place,
                address.city,
                address.district,
                address.pincode,
                address.state,
                address.country,
                address.location,
                address.createdAt,
                address.updatedAt,
            )
        }

    async createAddress(address: CreateAddressRequest): Promise<Address> {
        try{
            const newAddress = await AddressModel.create(address);
            return this.mapToEntity(newAddress);
        }catch(error){
            console.log("createAddress error : ",error);
            throw new Error("Failed to create address.");
        }
    }
    
    async findAddressByUserId(userId: Types.ObjectId): Promise<Address | null> {
        try{
            const address = await AddressModel.findOne({ userId: userId });
            return address ? this.mapToEntity(address) : null;
        }catch(error){
            console.log("findAddressByUserId error : ",error);
            throw new Error("Failed to fetch address");
        }
    }

    async findAddressById(addressId: Types.ObjectId): Promise<Address | null> {
        try{
            const address = await AddressModel.findOne(addressId);
            return address ? this.mapToEntity(address) : null;
        }catch(error){
            console.log("findAddressByUserId error : ",error);
            throw new Error("Failed to find address");
        }
    }
    
    async updateAddress(address: Address): Promise<Address | null> {
        try {
            const updatedAddress = await AddressModel.findOneAndUpdate(
                address._id,
                { ...address },
                { new : true }
            );
            return updatedAddress ? this.mapToEntity(updatedAddress) : null;
        } catch (error) {
            console.log("updateAddress error : ",error);
            throw new Error("Failed to update address");
        }
    }
}