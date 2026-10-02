import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, BadRequestError } from "../../../shared/error/appError";
import { UpdateUserTimeZoneInput, UpdateUserTimeZoneOutput } from "../../dtos/user.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";

export class UpdateUserTimeZoneUseCase {

    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    async execute(input: UpdateUserTimeZoneInput): Promise<UpdateUserTimeZoneOutput> {
        try {
            const { userId, timeZone } = input;
            if (!userId || !timeZone) {
                throw new BadRequestError();
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new AppError();
            }

            user.updateTimeZone({ timeZone });

            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) {
                throw new AppError();
            }

            return {
                timeZone: updatedUser.timeZone
            }
        } catch (error) {
            throw toAppError(error, "Failed to update user timezone");
        }
    }
}