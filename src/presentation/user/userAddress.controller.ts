import { getAddressUseCase } from "../address";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { validateUserIdSchema } from "../../shared/zod/user.zod";
import { GetAddressUseCase } from "../../application/useCases/address/getAddress.useCase";

class UserAddressController {
    constructor(
        private readonly getAddressUseCase: GetAddressUseCase,
    ) {
        this.getUserAddress = this.getUserAddress.bind(this);
    };

    async getUserAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = validateUserIdSchema.parse({ userId: req.params.userId });
            const result = await this.getAddressUseCase.execute({ userId });
            sendResponse(res, result, `Address ${result ? "fetched successfully" : "not added yet"}`);
        } catch (error) {
            log.error("getAddress failed", error as Error);
            next(error);
        };
    };
}

export const userAddressController = new UserAddressController(
    getAddressUseCase
);
