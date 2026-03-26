import { GetAddressUseCase } from "../../application/useCases/address/getAddress.useCase";
import { UpdateAddressUseCase } from "../../application/useCases/address/updateAddress.useCase";
import { UserCreateAddressUseCase } from "../../application/useCases/address/userCreateAddress.useCase";
import { addressRepository, providerRepository, userRepository } from "../../infrastructure/repositoryImpls";
import { ProviderCreateAddressUseCase } from "../../application/useCases/address/providerCreateAddress.useCase";

export const getAddressUseCase = new GetAddressUseCase(addressRepository);

export const userCreateAddressUseCase = new UserCreateAddressUseCase(userRepository, addressRepository);

export const providerCreateAddressUseCase = new ProviderCreateAddressUseCase(providerRepository, addressRepository);

export const updateAddressUseCase = new UpdateAddressUseCase(addressRepository);