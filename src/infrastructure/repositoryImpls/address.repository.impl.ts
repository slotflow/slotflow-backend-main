import { ClientSession } from "mongoose";
import { AddressModel } from "../models/address.model";
import { AddressMapper } from "../mappers/address.mapper";
import { Address } from "../../domain/entities/address.entity";
import { IAddressRepository } from "../../domain/interfaces/repositories/IAddress.repository";

export class AddressRepositoryImpl implements IAddressRepository {

    async create(address: Address, session?: ClientSession): Promise<Address> {
        const doc = await AddressModel.create(
            [AddressMapper.toPersistence(address)],
            { session }
        );
        return AddressMapper.toDomain(doc[0]);
    };

    async findByUserId(userId: string): Promise<Address | null> {
        const doc = await AddressModel.findOne({ userId });
        return doc ? AddressMapper.toDomain(doc) : null;
    };

    async findById(addressId: string): Promise<Address | null> {
        const doc = await AddressModel.findById(addressId);
        return doc ? AddressMapper.toDomain(doc) : null;
    };

    async update(address: Address, session?: ClientSession): Promise<Address | null> {
        const persistence = AddressMapper.toPersistence(address);

        const doc = await AddressModel.findByIdAndUpdate(
            address._id,
            { $set: persistence },
            { new: true, session }
        );

        return doc ? AddressMapper.toDomain(doc) : null;
    };

};