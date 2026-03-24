import { getAddressUseCase } from "../address";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { providerCreateAddressUseCase, providerUpdateAddressUseCase } from ".";
import { providerCreateAddressSchema, providerUpdateAddressSchema, validateProviderIdSchema } from "../../shared/zod/provider.zod";
import { ProviderCreateAddressUseCase, ProviderUpdateAddressUseCase } from "../../application/useCases/provider/providerAddress.useCase";
import { GetAddressUseCase } from "../../application/useCases/address/getAddress.useCase";

class ProviderAddressController {
    constructor(
        private providerCreateAddressUseCase: ProviderCreateAddressUseCase,
        private providerUpdateAddressUseCase: ProviderUpdateAddressUseCase,
        private readonly getAddressUseCase: GetAddressUseCase
    ) {
        this.createAddress = this.createAddress.bind(this);
        this.updateAddress = this.updateAddress.bind(this);
        this.getProviderAddress = this.getProviderAddress.bind(this);
    };

    async createAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId, ...address } = providerCreateAddressSchema.parse({
                ...req.body,
                providerId: (req.user as DecodedUser).userOrProviderId,
            });
            await this.providerCreateAddressUseCase.execute({
                userId: providerId,
                ...address
            });
            sendResponse(res, null, "Address saved successfully", true, 201);
        } catch (error) {
            log.error("createAddress failed", error as Error);
            next(error);
        };
    };

    async updateAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const { addressId, providerId, ...updateDta } = providerUpdateAddressSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId,
                addressId: req.params.addressId,
                ...req.body,
            });
            const result = await this.providerUpdateAddressUseCase.execute({ _id: addressId, userId: providerId, ...updateDta });
            sendResponse(res, result, "Address updated successfully");
        } catch (error) {
            log.error("updateAddress failed", error as Error);
            next(error);
        };
    };

     async getProviderAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse({
                providerId: req.params.providerId
            });
            const result = await this.getAddressUseCase.execute({ userId: providerId });
            sendResponse(res, result, `Address ${result ? "fetched successfully" : "not added yet"}`);
        } catch (error) {
            log.error("getProviderAddress failed", error as Error);
            next(error);
        };
    };

};

export const provideAddressController = new ProviderAddressController(
    providerCreateAddressUseCase,
    providerUpdateAddressUseCase,
    getAddressUseCase
);