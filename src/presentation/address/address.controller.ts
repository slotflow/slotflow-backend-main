import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { getAddressUseCase, updateAddressUseCase, userCreateAddressUseCase } from ".";
import { createAddressSchema, updateAddressSchema } from "../../shared/zod/address.zod";
import { GetAddressUseCase } from "../../application/useCases/address/getAddress.useCase";
import { UpdateAddressUseCase } from "../../application/useCases/address/updateAddress.useCase";
import { UserCreateAddressUseCase } from "../../application/useCases/address/userCreateAddress.useCase";

class AddressController {
    constructor(
        private readonly getAddressUseCase: GetAddressUseCase,
        private readonly userCreateAddressUseCase: UserCreateAddressUseCase,
        private readonly updateAddressUseCase: UpdateAddressUseCase,
    ) {
        this.getAddress = this.getAddress.bind(this);
        this.createAddress = this.createAddress.bind(this);
        this.updateAddress = this.updateAddress.bind(this);
    }

    async getAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const { providerId, userId } = req.params;

            const isMyAddress = !providerId && !userId;
            const targetId = providerId || userId || user.userOrProviderId;

            if (!targetId) throw new Error("ID is required");

            const result = await this.getAddressUseCase.execute({
                userId: targetId as string,
                isMyAddress
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("getAddress failed", error as Error);
            next(error);
        }
    }

    async createAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;

            const validatedData = createAddressSchema.parse({
                userId: user.userOrProviderId,
                ...req.body,
            });

            const result = await this.userCreateAddressUseCase.execute(validatedData);
            sendResponse(res, result);

        } catch (error) {
            log.error("createAddress failed : ", error as Error);
            next(error);
        }
    }

    async updateAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const addressId = req.params.addressId;
            const validatedData = updateAddressSchema.parse({
                addressId,
                ...req.body,
            });
            const result = await this.updateAddressUseCase.execute({
                ...validatedData,
                _id: validatedData.addressId
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("updateAddress failed : ", error as Error);
            next(error);
        }
    }

}

export const addressController = new AddressController(
    getAddressUseCase,
    userCreateAddressUseCase,
    updateAddressUseCase
);