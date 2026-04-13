import { addressRepository, userRepository } from "../../infrastructure/repositoryImpls";
import { GetAddressUseCase } from "../../application/useCases/address/getAddress.useCase";
import { UpdateAddressUseCase } from "../../application/useCases/address/updateAddress.useCase";
import { UserCreateAddressUseCase } from "../../application/useCases/address/userCreateAddress.useCase";

export const getAddressUseCase = new GetAddressUseCase(addressRepository);

export const userCreateAddressUseCase = new UserCreateAddressUseCase(userRepository, addressRepository);

export const updateAddressUseCase = new UpdateAddressUseCase(addressRepository);