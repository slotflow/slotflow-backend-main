import { Types } from "mongoose";
import { IAddress } from "../models/address.model";
import { Address } from "../../domain/entities/address.entity";

export class AddressMapper {

    static toDomain(doc: IAddress): Address {
        return new Address({
            _id: doc._id.toString(),
            userId: doc.userId.toString(),
            addressLine: doc.addressLine,
            landMark: doc.landMark,
            phone: doc.phone,
            place: doc.place,
            city: doc.city,
            district: doc.district,
            pincode: doc.pincode,
            state: doc.state,
            country: doc.country,
            location: doc.location,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }

    static toPersistence(entity: Address) {
        const props = entity.getProps();

        return {
            userId: new Types.ObjectId(props.userId),
            addressLine: props.addressLine,
            landMark: props.landMark,
            phone: props.phone,
            place: props.place,
            city: props.city,
            district: props.district,
            pincode: props.pincode,
            state: props.state,
            country: props.country,
            location: props.location,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt
        };
    }
}
