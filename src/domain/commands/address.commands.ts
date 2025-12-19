import { AddressProps } from "../contracts/address.contract";

export type CreateAddressProps = Omit<AddressProps, "_id" | "createdAt" | "updatedAt">;

export type UpdateAddressProps = Partial<Omit<AddressProps, "_id" | "userId" | "createdAt" | "updatedAt">>;