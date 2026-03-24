import { getAddressUseCase } from ".";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { GetAddressUseCase } from "../../application/useCases/address/getAddress.useCase";


class AddressController {
    constructor(
        private readonly getAddressUseCase: GetAddressUseCase
    ) {
        this.getMyAddress = this.getMyAddress.bind(this);
    }

    async getMyAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const result = await this.getAddressUseCase.execute({ userId: user.userOrProviderId });
            sendResponse(res, result);
        } catch (error) {
            log.error("getMyAddress failed : ", error as Error);
            next(error);
        }
    }

    async createAddress(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            log.error("createAddress failed : ", error as Error);
            next(error);
        }
    }

}

export const addressController = new AddressController(
    getAddressUseCase
);