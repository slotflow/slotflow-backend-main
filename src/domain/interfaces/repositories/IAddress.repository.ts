import { Types } from "mongoose";
import { Address } from "../../entities/address.entity";
import { CreateAddressRequest } from "../../../infrastructure/dtos/common.dto";

export interface IAddressRepository {
    
    createAddress(address: CreateAddressRequest): Promise<Address>;

    findAddressByUserId(userId: Types.ObjectId): Promise<Address | null>;

    findAddressById(addressId: Types.ObjectId): Promise<Address | null>;

    updateAddress(address: Address): Promise<Address | null>;
}