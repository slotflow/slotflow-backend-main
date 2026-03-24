import { addressRepository } from "../../infrastructure/repositoryImpls";
import { GetAddressUseCase } from "../../application/useCases/address/getAddress.useCase";

export const getAddressUseCase = new GetAddressUseCase(addressRepository);