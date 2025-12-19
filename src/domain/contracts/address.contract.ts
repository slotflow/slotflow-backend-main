export type GeoLocation = {
    type: "Point";
    coordinates: [number, number];
};

export interface AddressProps {
    _id: string,
    userId: string,
    addressLine: string,
    landMark: string,
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