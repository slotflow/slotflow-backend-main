import { AddressModel } from "../database/address.model";
import { AddressMapper } from "../mappers/address.mapper";
import { Address } from "../../domain/entities/address.entity";
import { IAddressRepository } from "../../domain/interfaces/repositories/IAddress.repository";

export class AddressRepositoryImpl implements IAddressRepository {

    async create(address: Address): Promise<Address> {
        const doc = await AddressModel.create(
            AddressMapper.toPersistence(address)
        );
        return AddressMapper.toDomain(doc);
    };

    async findByUserId(userId: string): Promise<Address | null> {
        const doc = await AddressModel.findOne({ userId });
        return doc ? AddressMapper.toDomain(doc) : null;
    };

    async findById(addressId: string): Promise<Address | null> {
        const doc = await AddressModel.findById(addressId);
        return doc ? AddressMapper.toDomain(doc) : null;
    };

    async update(address: Address): Promise<Address> {
        const persistence = AddressMapper.toPersistence(address);

        const doc = await AddressModel.findByIdAndUpdate(
            address._id,
            { $set: persistence },
            { new: true }
        );

        if (!doc) throw new Error("Address not found");
        return AddressMapper.toDomain(doc);
    };

};