import { log } from "../../../shared/logger/logger";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { UpdateUserProfileInfoRequest, UpdateUserProfileInfoResponse } from "../../dtos/user.dto";

export class UpdateUserProfileInfoUseCase {
    constructor(
        private userRepository: IUserRepository
    ) { };

    async execute(payload: UpdateUserProfileInfoRequest): Promise<UpdateUserProfileInfoResponse> {
        try {
            const { userId, username, phone } = payload;

            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("No user found");

            user.updateProfileInfo({
                phone: phone ?? undefined,
                username: username ?? undefined
            });

            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) throw new Error("Info adding failed, please try again");

            return { username: updatedUser.username, phone: updatedUser.phone };;
        } catch (error) {
            log.error("UpdateUserProfileInfoUseCase failed", error as Error);
            throw error;
        };
    };
};