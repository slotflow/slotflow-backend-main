import mongoose, { Document, Schema, Types } from "mongoose";
import { GeoLocation } from "../../../domain/contracts/address.contract";
import { addressLineRegex, cityRegex, countryRegex, districtRegex, landMarkRegex, phoneRegex, pincodeRegex, placeRegex, stateRegex } from '../../../shared/zod/regex';

export interface IAddress extends Document {
    _id: Types.ObjectId,
    userId: Types.ObjectId,
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
};

const addressSchema = new Schema<IAddress>({
    userId: {
        type: Schema.Types.ObjectId,
        required: [true, "UserId is required"],
        unique: true,
    },
    addressLine: {
        type: String,
        required: [true, "Address line is required"],
        minlength: [10, "Address line must be at least 10 characters"],
        maxlength: [150, "Address line must be at most 150 characters"],
        match: [addressLineRegex, "Address line can only include letters, numbers, spaces, and the symbols . , # -",],
    },
    landMark: {
        type: String,
        required: [true, "Land mark is required"],
        minlength: [5, "Land mark must be at least 5 characters"],
        maxlength: [150, "Land mark must be at most 150 characters"],
        match: [landMarkRegex, "Land mark can only include letters, numbers, spaces, and the symbols . , # -",],
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        minlength: [7, "Phone number must be at least 7 characters"],
        maxlength: [20, "Phone number must be at most 20 characters"],
        match: [phoneRegex, "Invalid phone number. Only digits, spaces, dashes (-), dots (.), parentheses (), and an optional + at the beginning are allowed. Length must be between 7 to 20 characters."],
    },
    place: {
        type: String,
        required: [true, "Place is required"],
        minlength: [3, "Place must be at least 3 characters"],
        maxlength: [50, "Place must be at most 50 characters"],
        match: [placeRegex, "Place must only contain letters, spaces, dots, and hyphens"],
    },
    city: {
        type: String,
        required: [true, "City is required"],
        minlength: [3, "City must be at least 3 characters"],
        maxlength: [50, "City must be at most 50 characters"],
        match: [cityRegex, "City must only contain letters and spaces"],
    },
    district: {
        type: String,
        required: [true, "District is required"],
        minlength: [3, "District must be at least 3 characters"],
        maxlength: [50, "District must be at most 50 characters"],
        match: [districtRegex, "District must only contain letters and spaces"],
    },
    pincode: {
        type: String,
        required: [true, "Postal code is required"],
        minlength: [3, "Postal code must be at least 3 characters"],
        maxlength: [12, "Postal code must be at most 12 characters"],
        match: [pincodeRegex, "Postal code can only include letters, numbers, spaces, and hyphens"],
    },
    state: {
        type: String,
        required: [true, "State is required"],
        minlength: [2, "State must be at least 2 characters"],
        maxlength: [50, "State must be at most 50 characters"],
        match: [stateRegex, "State must only contain letters and spaces"],
    },
    country: {
        type: String,
        required: [true, "Country is required"],
        minlength: [2, "Country must be at least 2 characters"],
        maxlength: [50, "Country must be at most 50 characters"],
        match: [countryRegex, "Country must only contain letters and spaces"],
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: function (coords: number[]) {
                    return coords.length === 2;
                },
                message: "Coordinates must be an array of [longitude, latitude]",
            },
        },
    },
    createdAt: {
        type: Date,
        required: true
    },
    updatedAt: {
        type: Date,
        required: true
    }
});

addressSchema.index({ location: "2dsphere" });

export const AddressModel = mongoose.model<IAddress>('Address', addressSchema);