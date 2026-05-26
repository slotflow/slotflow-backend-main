import { AddressDTO, UserDTO } from "./common.dto";

//// **** address usecase dtos **** ////

// GetAddress usecase input output
export interface GetAddressInput {
    userId: UserDTO["_id"];
    isMyAddress?: boolean;
}
export type GetAddressOutput = Pick<AddressDTO, "addressLine" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "landMark" | "location"> & Partial<Pick<AddressDTO, "_id">> | null;

// CreateAddress usecase input output
export type CreateAddressInput = Pick<AddressDTO, "userId" | "addressLine" | "landMark" | "place" | "phone" | "city" | "country" | "district" | "pincode" | "state" | "location">;
export type CreateAddressOutput = Pick<AddressDTO, "_id" | "addressLine" | "landMark" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "location" | "updatedAt">;

// UpdateAddress usecase input output
export type UpdateAddressInput = Pick<AddressDTO, "_id" | "addressLine" | "landMark" | "place" | "phone" | "city" | "country" | "district" | "pincode" | "state" | "location">;
export type UpdateAddressOutput = Pick<AddressDTO, "_id" | "addressLine" | "landMark" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "location">;