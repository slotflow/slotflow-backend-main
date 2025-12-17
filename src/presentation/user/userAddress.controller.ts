import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { CreateAddressZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
import { IUserRepository } from "../../domain/interfaces/repositories/IUser.repository";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { IAddressRepository } from "../../domain/interfaces/repositories/IAddress.repository";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";
import { UserCreateAddressUseCase, UserFetchAddressUseCase, UserUpdateAddressUseCase } from "../../application/useCases/user/userAddress.useCase";
import { Types } from "mongoose";

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
    }

    async getAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            if (!userId) throw new Error("Invalid request.");
            const result = await this.userFetchAddressUseCase.execute({ userId: new Types.ObjectId(userId) });
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

    async createAddress(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("crwating address");
            const userId = (req.user as DecodedUser).userOrProviderId;
            if (!userId) throw new Error("Invalid request");
            const validateData = CreateAddressZodSchema.parse(req.body)
            await this.userCreateAddressUseCase.execute({ userId, ...validateData });
            res.status(200).json({
                success: true,
                message: "Address saved successfully"
            });
        } catch (error) {
            console.log("addAddress error : ", error);
            next(error);
        }
    }

    async updateAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            if (!userId) throw new Error("Invalid request.");
            const { id: addressId } = ValidateObjectId(req.params.addressId, "Address ID");
            if (!addressId) throw new Error("Invalid request");
            const validateData = CreateAddressZodSchema.parse(req.body);
            const result = await this.userUpdateAddressUseCase.execute({ _id: addressId, userId, ...validateData });
            res.status(200).json({
                success: true,
                message: "Address updated successfully",
                data: result
            });
        } catch (error) {
            console.log("updateAddress error : ", error);
            next(error);
        }
    }
}

export const userAddressController = new UserAddressController(
    userFetchAddressUseCase,
    userCreateAddressUseCase,
    userUpdateAddressUseCase
);
