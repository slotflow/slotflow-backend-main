import { AddressDTO } from "./common.dto";

// interface for get address use case request payload
export interface GetAddressRequest {
    userId: string;
    isMyAddress?: boolean;
}

// type for get address use case response
export type GetAddressResponse = Pick<AddressDTO, "addressLine" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "landMark" | "location"> & Partial<Pick<AddressDTO, "_id">> | null;

// type for create address use case request payload
export type CreateAddressRequest = Pick<AddressDTO, "userId" | "addressLine" | "landMark" | "place" | "phone" | "city" | "country" | "district" | "pincode" | "state" | "location">;

// type for create address use case response
export type CreateAddressResponse = Pick<AddressDTO, "_id" | "addressLine" | "landMark" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "location" | "updatedAt">;

// type for update address use case request payload
export type UpdateAddressRequest = Pick<AddressDTO, "_id" | "addressLine" | "landMark" | "place" | "phone" | "city" | "country" | "district" | "pincode" | "state" | "location">;

// type for update address use case response
export type UpdateAddressResponse = Pick<AddressDTO, "_id" | "addressLine" | "landMark" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "location">;