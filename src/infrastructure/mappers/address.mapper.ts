import { Types } from "mongoose";
import { IAddress } from "../database/address/address.model";
import { Address } from "../../domain/entities/address.entity";

export class AddressMapper {

    static toDomain(doc: IAddress): Address {
        return new Address(
            doc._id.toString(),
            doc.userId.toString(),
            doc.addressLine,
            doc.landMark,
            doc.phone,
            doc.place,
            doc.city,
            doc.district,
            doc.pincode,
            doc.state,
            doc.country,
            doc.location,
            doc.createdAt,
            doc.updatedAt
        );
    }

    static toPersistence(entity: Address) {
        return {
            userId: new Types.ObjectId(entity.userId),
            addressLine: entity.addressLine,
            landMark: entity.landMark,
            phone: entity.phone,
            place: entity.place,
            city: entity.city,
            district: entity.district,
            pincode: entity.pincode,
            state: entity.state,
            country: entity.country,
            location: entity.location,
            updatedAt: entity.updatedAt
        };
    }
}
