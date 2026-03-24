import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { GetAddressUseCase } from "../../application/useCases/address/getAddress.useCase";
import { getAddressUseCase, providerCreateAddressUseCase, updateAddressUseCase, userCreateAddressUseCase } from ".";
import { UserCreateAddressUseCase } from "../../application/useCases/address/userCreateAddress.useCase";
import { ProviderCreateAddressUseCase } from "../../application/useCases/address/providerCreateAddress.useCase";
import { UpdateAddressUseCase } from "../../application/useCases/address/updateAddress.useCase";
import { createAddressSchema, updateAddressSchema } from "../../shared/zod/address.zod";

class AddressController {
    constructor(
        private readonly getAddressUseCase: GetAddressUseCase,
        private readonly userCreateAddressUseCase: UserCreateAddressUseCase,
        private readonly providerCreateAddressUseCase: ProviderCreateAddressUseCase,
        private readonly updateAddressUseCase: UpdateAddressUseCase,
    ) {
        this.getMyAddress = this.getMyAddress.bind(this);
    }

    async getMyAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const result = await this.getAddressUseCase.execute({ userId: user.userOrProviderId, isMyAddress: true });
            sendResponse(res, result);
        } catch (error) {
            log.error("getMyAddress failed : ", error as Error);
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

            if (user.role === Role.USER) {
                const result = await this.userCreateAddressUseCase.execute(validatedData);
                sendResponse(res, result);
            }

            if (user.role === Role.PROVIDER) {
                const result = await this.providerCreateAddressUseCase.execute(validatedData);
                sendResponse(res, result);
            }
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
    providerCreateAddressUseCase,
    updateAddressUseCase
);