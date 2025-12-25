import { DecodedUser } from "../../express";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { CreateAddressZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
import { IUserRepository } from "../../domain/interfaces/repositories/IUser.repository";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { IAddressRepository } from "../../domain/interfaces/repositories/IAddress.repository";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";
import { UserCreateAddressUseCase, UserFetchAddressUseCase, UserUpdateAddressUseCase } from "../../application/useCases/user/userAddress.useCase";

const userRepository: IUserRepository = new UserRepositoryImpl();
const addressRepository: IAddressRepository = new AddressRepositoryImpl();

const userUpdateAddressUseCase = new UserUpdateAddressUseCase(addressRepository);
const userFetchAddressUseCase = new UserFetchAddressUseCase(userRepository, addressRepository);
const userCreateAddressUseCase = new UserCreateAddressUseCase(userRepository, addressRepository);

class UserAddressController {
    constructor(
        private userFetchAddressUseCase: UserFetchAddressUseCase,
        private userCreateAddressUseCase: UserCreateAddressUseCase,
        private userUpdateAddressUseCase: UserUpdateAddressUseCase,
    ) {
        this.getAddress = this.getAddress.bind(this);
        this.createAddress = this.createAddress.bind(this);
        this.updateAddress = this.updateAddress.bind(this);
    };

    async getAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            if (!userId) throw new Error("Invalid request.");
            const result = await this.userFetchAddressUseCase.execute({ userId });
             sendResponse(res, result, `Address ${result ? "fetched successfully" : "not added yet"}`);
        } catch (error) {
            log.error("getAddress failed", error as Error);
            next(error);
        };
    };

    async createAddress(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("crwating address");
            const userId = (req.user as DecodedUser).userOrProviderId;
            if (!userId) throw new Error("Invalid request");
            const validateData = CreateAddressZodSchema.parse(req.body)
            await this.userCreateAddressUseCase.execute({ userId, ...validateData });
            sendResponse(res, null, "Address saved successfully", true, 201);
        } catch (error) {
            log.error("addAddress failed", error as Error);
            next(error);
        };
    };

    async updateAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            if (!userId) throw new Error("Invalid request.");
            const { id: addressId } = ValidateObjectId(req.params.addressId, "Address ID");
            if (!addressId) throw new Error("Invalid request");
            const validateData = CreateAddressZodSchema.parse(req.body);
            const result = await this.userUpdateAddressUseCase.execute({ _id: addressId, userId, ...validateData });
            sendResponse(res, result,"Address updated successfully");
        } catch (error) {
            log.error("updateAddress failed", error as Error);
            next(error);
        };
    };
}

export const userAddressController = new UserAddressController(
    userFetchAddressUseCase,
    userCreateAddressUseCase,
    userUpdateAddressUseCase
);
