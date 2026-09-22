import { GeoLocation } from "../commands/address.commands";

export interface AddressProps {
    _id: string,
    userId: string,
    addressLine: string,
    landmark: string,
    phone: string,
    place: string,
    city: string,
    district: string,
    pincode: string,
    state: string,
    country: string,
    location: GeoLocation,
    createdAt: Date,
    updatedAt: Date,
}