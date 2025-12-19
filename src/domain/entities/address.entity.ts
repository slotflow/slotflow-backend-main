import { AddressProps } from "../contracts/address.contract";
import { CreateAddressProps, UpdateAddressProps } from "../commands/address.commands";

export class Address {
    private props: AddressProps;

    constructor(props: AddressProps) {
        this.props = props;
    }

    private touch() {
        this.props.updatedAt = new Date();
    }

    static create(props: CreateAddressProps) {
        return new Address({
            _id: "",
            addressLine: props.addressLine,
            city: props.city,
            country: props.country,
            district: props.district,
            landMark: props.landMark,
            location: props.location,
            phone: props.phone,
            pincode: props.pincode,
            place: props.place,
            state: props.state,
            userId: props.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    // Getters

    get _id(): string {
        return this.props._id;
    }

    // Business Methods

    getProps(): Readonly<AddressProps> {
        return { ...this.props };
    }

    updateAddress(props: UpdateAddressProps) {
        this.props = {
            ...this.props,
            ...props,
        };

        this.touch();
    }
}