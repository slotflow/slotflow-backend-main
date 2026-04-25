import { log } from "../../shared/logger/logger";
import { ERROR_CODES } from "../../shared/utils/types";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { BadRequestError } from "../../shared/error/appError";
import { DecodedUser } from "../../application/dtos/common.dto";
import { getAddressUseCase, updateAddressUseCase, userCreateAddressUseCase } from ".";
import { GetAddressUseCase } from "../../application/useCases/address/getAddress.useCase";
import { UpdateAddressUseCase } from "../../application/useCases/address/updateAddress.useCase";
import { UserCreateAddressUseCase } from "../../application/useCases/address/userCreateAddress.useCase";
import { createAddressSchema, getAddressSchema, updateAddressSchema } from "../../shared/zod/address.zod";

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
            const { providerId, userId } = getAddressSchema.parse(req.params);

            const isMyAddress = !providerId && !userId;
            const targetId = providerId || userId || user.id;

            if (!targetId) throw new BadRequestError("ID is required", ERROR_CODES.INVALID_REQUEST);

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
                ...req.body,
            });
            const result = await this.userCreateAddressUseCase.execute({
                ...validatedData,
                userId: user.id
            });
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