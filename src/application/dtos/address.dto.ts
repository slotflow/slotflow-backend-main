import { AddressDTO } from "./common.dto";

export interface GetAddressRequest {
    userId: string;
    isMyAddress?: boolean;
}

export type GetAddressResponse = Pick<AddressDTO, "addressLine" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "landMark" | "location"> & Partial<Pick<AddressDTO, "_id">> | null;

export type CreateAddressRequest = Pick<AddressDTO, "userId" | "addressLine" | "landMark" | "place" | "phone" | "city" | "country" | "district" | "pincode" | "state" | "location">;

export type CreateAddressResponse = Pick<AddressDTO, "_id" | "addressLine" | "landMark" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "location" | "updatedAt">;
