import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { CreateAddressZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
import { IAddressRepository } from "../../domain/interfaces/repositories/IAddress.repository";
import { IProviderRepository } from "../../domain/interfaces/repositories/IProvider.repository";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { ProviderCreateAddressUseCase, ProviderFetchAddressUseCase, ProviderUpdateAddressUseCase } from "../../application/useCases/provier/providerAddress.useCase";
import { Types } from "mongoose";

const addressRepository: IAddressRepository = new AddressRepositoryImpl();
const providerRepository: IProviderRepository = new ProviderRepositoryImpl();

const providerFetchAddressUseCase = new ProviderFetchAddressUseCase(addressRepository);
const providerUpdateAddressUseCase = new ProviderUpdateAddressUseCase(addressRepository);
const providerCreateAddressUseCase = new ProviderCreateAddressUseCase(providerRepository, addressRepository);

class ProviderAddressController {
    constructor(
        private providerCreateAddressUseCase: ProviderCreateAddressUseCase,
        private providerFetchAddressUseCase: ProviderFetchAddressUseCase,
        private providerUpdateAddressUseCase: ProviderUpdateAddressUseCase,
    ) {
        this.createAddress = this.createAddress.bind(this);
        this.getAddress = this.getAddress.bind(this);
        this.updateAddress = this.updateAddress.bind(this);
    }

    async createAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const validateData = CreateAddressZodSchema.parse(req.body);
            await this.providerCreateAddressUseCase.execute({ userId: providerId, ...validateData });
            res.status(201).json({
                success: true,
                message: "Address saved successfully"
            });
        } catch (error) {
            console.log("createAddress error : ", error);
            next(error)
        }
    }

    async getAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            if (!providerId) throw new Error("Invalid request.");
            const result = await this.providerFetchAddressUseCase.execute({ providerId: new Types.ObjectId(providerId) });
            res.status(200).json({
                success: true,
                message: result
                    ? "Address fetched successfully"
                    : "Address not added yet",
                data: result,
            });
        } catch (error) {
            console.log("getAddress error : ", error);
            next(error);
        }

    }

    async updateAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            if (!providerId) throw new Error("Invalid request");
            const { id: addressId } = ValidateObjectId(req.params.addressId, "Address ID");
            if (!addressId) throw new Error("Invalid request");
            const validateData = CreateAddressZodSchema.parse(req.body);
            const result = await this.providerUpdateAddressUseCase.execute({ _id: addressId, userId: providerId, ...validateData });
            res.status(200).json({
                success: true,
                message: "Address updated successfully",
                data: result
            });
        } catch (error) {
            console.log("updateAddress error : ", error);
            next(error)
        }
    }

}

export const provideAddressController = new ProviderAddressController(
    providerCreateAddressUseCase,
    providerFetchAddressUseCase,
    providerUpdateAddressUseCase
);