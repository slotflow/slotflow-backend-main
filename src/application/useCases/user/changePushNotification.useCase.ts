import { log } from "../../../shared/logger/logger";
import { ChangePushNotificationInput } from "../../dtos/user.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";

export class ChangePushNotificationUseCase {
    constructor(
        private userRepository: IUserRepository
    ) { };

    async execute(input: ChangePushNotificationInput): Promise<void> {
        try {
            const { allowPushNotification, userId } = input;

            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("No user found");

            user.updatePushNotification({ allowPushNotification });

            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) throw new Error("Info adding failed, please try again");
        } catch (error) {
            log.error("ChangePushNotificationUseCase failed", error as Error);
            throw error;
        };
    };
};