export type GeoLocation = {
    type: "Point";
    coordinates: [number, number];
};

export class Address {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public addressLine: string,
        public landMark: string,
        public phone: string,
        public place: string,
        public city: string,
        public district: string,
        public pincode: string,
        public state: string,
        public country: string,
        public location: GeoLocation,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }
}