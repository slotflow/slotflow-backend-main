import { Types } from "mongoose";
import { roleArray } from "../../../shared/utils/constants";
import { CheckUserStatusRequest, CheckUserStatusResponse } from "../../dtos/auth.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";


export class CheckUserStatusUseCase {
    constructor(
        private userRepository: IUserRepository, 
        private providerRepository: IProviderRepository
    ){}

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
                const provider = await this.providerRepository.findById(_id);
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