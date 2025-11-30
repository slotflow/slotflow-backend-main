import { Types } from "mongoose";
import { roleArray } from "../../utils/constants";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { CheckUserStatusRequest, CheckUserStatusResponse } from "../../infrastructure/dtos/auth.dto";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";


export class CheckUserStatusUseCase {
    constructor(private userRepository: UserRepositoryImpl, private providerRepository: ProviderRepositoryImpl){}

    async execute(payload: CheckUserStatusRequest) : Promise<CheckUserStatusResponse> {
        try {

            const { _id, role } = payload;
            
            if (role === roleArray[1]) {
                const user = await this.userRepository.findUserById(new Types.ObjectId(_id));
                if (user?.isBlocked) {
                    return { status: 403, success: false, message: "Your account has been blocked." };
                } else {
                    return { status: 200, success: true, message: "Your account is active." };
                }
            } else if (role === roleArray[2]) {
                const provider = await this.providerRepository.findProviderById(new Types.ObjectId(_id));
                if (provider?.isBlocked) {
                    return { status: 403, success: false, message: "Your account has been blocked." };
                } else {
                    return { status: 200, success: true, message: "Your account is active." };
                }
            } else {
                return { status: 400, success: false, message: "Invalid role." };
            }
        } catch (error) {
            console.log("CheckUserStatusUseCase error : ",error);
            throw new Error("Failed to check user status");
        }
    }
}