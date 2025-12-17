import { Address } from "../../entities/address.entity";

export interface IAddressRepository {

    create(address: Address): Promise<Address>;

    findByUserId(userId: string): Promise<Address | null>;

    findById(addressId: string): Promise<Address | null>;

    update(address: Address): Promise<Address>;
    
}