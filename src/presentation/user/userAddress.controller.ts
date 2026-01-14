import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { userCreateAddressUseCase, userFetchAddressUseCase, userUpdateAddressUseCase } from ".";
import { userCreateAddressSchema, userUpdateAddressSchema, validateUserIdSchema } from "../../shared/zod/user.zod";
import { UserCreateAddressUseCase, UserFetchAddressUseCase, UserUpdateAddressUseCase } from "../../application/useCases/user/userAddress.useCase";

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
            const { userId } = validateUserIdSchema.parse((req.user as DecodedUser).userOrProviderId);
            const result = await this.userFetchAddressUseCase.execute({ userId });
            sendResponse(res, result, `Address ${result ? "fetched successfully" : "not added yet"}`);
        } catch (error) {
            log.error("getAddress failed", error as Error);
            next(error);
        };
    };

    async createAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, ...address } = userCreateAddressSchema.parse({
                ...req.body,
                providerId: (req.user as DecodedUser).userOrProviderId,
            });
            await this.userCreateAddressUseCase.execute({ userId, ...address });
            sendResponse(res, null, "Address saved successfully", true, 201);
        } catch (error) {
            log.error("addAddress failed", error as Error);
            next(error);
        };
    };

    async updateAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const { addressId, userId, ...updateDta } = userUpdateAddressSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId,
                addressId: req.params.addressId,
                ...req.body,
            });
            const result = await this.userUpdateAddressUseCase.execute({ _id: addressId, userId, ...updateDta });
            sendResponse(res, result, "Address updated successfully");
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
