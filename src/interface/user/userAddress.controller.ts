import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { CreateAddressZodSchema, ValidateObjectId } from "../../infrastructure/zod/common.zod";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";
import { UserCreateAddressUseCase, UserFetchAddressUseCase, UserUpdateAddressUseCase } from "../../application/user-use.case/userAddress.use-case";

const userRepositoryImpl = new UserRepositoryImpl();
const addressRepositoryImpl = new AddressRepositoryImpl();

const userCreateAddressUseCase = new UserCreateAddressUseCase(userRepositoryImpl, addressRepositoryImpl);
const userFetchAddressUseCase = new UserFetchAddressUseCase(userRepositoryImpl, addressRepositoryImpl);
const userUpdateAddressUseCase = new UserUpdateAddressUseCase(addressRepositoryImpl);

export class UserAddressController {
    constructor(
        private userFetchAddressUseCase: UserFetchAddressUseCase,
        private userCreateAddressUseCase: UserCreateAddressUseCase,
        private userUpdateAddressUseCase: UserUpdateAddressUseCase,
    ) {
        this.getAddress = this.getAddress.bind(this);
        this.addAddress = this.addAddress.bind(this);
        this.updateAddress = this.updateAddress.bind(this);
    }

    async getAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            if (!userId) throw new Error("Invalid request.");
            const result = await this.userFetchAddressUseCase.execute({ userId: new Types.ObjectId(userId) });
            res.status(200).json(result);
        } catch (error) {
            console.log("getAddress error : ", error);
            next(error);
        }
    }

    async addAddress(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("crwating address");
            const userId = (req.user as DecodedUser).userOrProviderId;
            const validateData = CreateAddressZodSchema.parse(req.body)
            const { addressLine, landMark, phone, place, city, district, pincode, state, country, location } = validateData;
            const result = await this.userCreateAddressUseCase.execute({ userId: new Types.ObjectId(userId), addressLine, landMark, phone, place, city, district, pincode, state, country, location });
            res.status(200).json(result);
            if (!userId) throw new Error("Invalid request.");
        } catch (error) {
            console.log("addAddress error : ", error);
            next(error);
        }
    }

    async updateAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { id: addressId } = ValidateObjectId(req.params.addressId, "Address ID");
            if (!addressId) throw new Error("Invalid request");
            const validateData = CreateAddressZodSchema.parse(req.body);
            const { addressLine, landMark, phone, place, city, district, pincode, state, country, location } = validateData;
            const result = await this.userUpdateAddressUseCase.execute({ _id: new Types.ObjectId(addressId), userId: new Types.ObjectId(userId), addressLine, landMark, phone, place, city, district, pincode, state, country, location });
            res.status(200).json(result);
        } catch (error) {
            console.log("updateAddress error : ", error);
            next(error)
        }
    }
}

const userAddressController = new UserAddressController(
    userFetchAddressUseCase,
    userCreateAddressUseCase,
    userUpdateAddressUseCase
);
export { userAddressController };