import { UserProps } from "../../domain/contracts/user.contract";
import { AddressProps } from "../../domain/contracts/address.contract";

/**
 * Address usecase dtos
 */

// GetAddress
export interface GetAddressInput {
    userId: UserProps["_id"];
    isMyAddress?: boolean;
}
export type GetAddressOutput = Pick<AddressProps, "addressLine" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "landmark" | "location"> & Partial<Pick<AddressProps, "_id">> | null;


// CreateAddress
export type CreateAddressInput = Pick<AddressProps, "userId" | "addressLine" | "landmark" | "place" | "phone" | "city" | "country" | "district" | "pincode" | "state" | "location">;
export type CreateAddressOutput = Pick<AddressProps, "_id" | "addressLine" | "landmark" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "location" | "updatedAt">;


// UpdateAddress
export type UpdateAddressInput = Pick<AddressProps, "_id" | "addressLine" | "landmark" | "place" | "phone" | "city" | "country" | "district" | "pincode" | "state" | "location">;
export type UpdateAddressOutput = Pick<AddressProps, "_id" | "addressLine" | "landmark" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "location">;