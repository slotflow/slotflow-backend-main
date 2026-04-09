import { AddressProps, GeoLocation } from "../contracts/address.contract";
import { CreateAddressProps, UpdateAddressProps } from "../commands/address.commands";

export class Address {
    private props: AddressProps;

    constructor(props: AddressProps) {
        this.props = props;
    };

    private touch() {
        this.props.updatedAt = new Date();
    };

    static create(props: CreateAddressProps): Address {
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

    get userId(): string {
        return this.props.userId;
    }

    get addressLine(): string {
        return this.props.addressLine;
    }

    get landMark(): string {
        return this.props.landMark;
    }

    get phone(): string {
        return this.props.phone;
    }

    get place(): string {
        return this.props.place;
    }

    get city(): string {
        return this.props.city;
    }

    get district(): string {
        return this.props.district;
    }

    get pincode(): string {
        return this.props.pincode;
    }

    get state(): string {
        return this.props.state;
    }

    get country(): string {
        return this.props.country;
    }

    get location(): GeoLocation {
        return this.props.location;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    // Business Methods

    getProps(): Readonly<AddressProps> {
        return { ...this.props };
    };

    updateAddress(props: UpdateAddressProps) {
        this.props = {
            ...this.props,
            ...props,
        };

        this.touch();
    }
}