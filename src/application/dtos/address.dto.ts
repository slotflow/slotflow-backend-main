import { AddressDTO, UserDTO } from "./common.dto";

// interface for get address use case request payload
export interface GetAddressInput {
    userId: UserDTO["_id"];
    isMyAddress?: boolean;
}

// type for get address use case response
export type GetAddressOutput = Pick<AddressDTO, "addressLine" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "landMark" | "location"> & Partial<Pick<AddressDTO, "_id">> | null;

// type for create address use case request payload
export type CreateAddressInput = Pick<AddressDTO, "userId" | "addressLine" | "landMark" | "place" | "phone" | "city" | "country" | "district" | "pincode" | "state" | "location">;

// type for create address use case response
export type CreateAddressOutput = Pick<AddressDTO, "_id" | "addressLine" | "landMark" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "location" | "updatedAt">;

// type for update address use case request payload
export type UpdateAddressInput = Pick<AddressDTO, "_id" | "addressLine" | "landMark" | "place" | "phone" | "city" | "country" | "district" | "pincode" | "state" | "location">;

// type for update address use case response
export type UpdateAddressOutput = Pick<AddressDTO, "_id" | "addressLine" | "landMark" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "location">;