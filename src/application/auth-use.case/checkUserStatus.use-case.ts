import { Types } from "mongoose";
import { Role } from "../../infrastructure/dtos/common.dto";
import { Validator } from "../../infrastructure/validator/validator";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { CheckUserStatusRequest, CheckUserStatusResponse } from "../../infrastructure/dtos/auth.dto";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";


export class CheckUserStatusUseCase {
    constructor(private userRepository: UserRepositoryImpl, private providerRepository: ProviderRepositoryImpl){}

    async execute(data: CheckUserStatusRequest) : Promise<CheckUserStatusResponse> {
        const { _id, role } = data;

        Validator.validateObjectId(_id);
        Validator.validateRole(role);

        if (role === Role.user) {
            const user = await this.userRepository.findUserById(new Types.ObjectId(_id));
            if (user?.isBlocked) {
                return { status: 403, success: false, message: "Your account has been blocked." };
            } else {
                return { status: 200, success: true, message: "Your account is active." };
            }
        } else if (role === Role.provider) {
            const provider = await this.providerRepository.findProviderById(new Types.ObjectId(_id));
            if (provider?.isBlocked) {
                return { status: 403, success: false, message: "Your account has been blocked." };
            } else {
                return { status: 200, success: true, message: "Your account is active." };
            }
        } else {
            return { status: 400, success: false, message: "Invalid role." };
        }
    }
}