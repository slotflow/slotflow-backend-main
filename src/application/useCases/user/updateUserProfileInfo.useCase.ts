import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { UpdateUserProfileInfoInput, UpdateUserProfileInfoOutput } from "../../dtos/user.dto";

export class UpdateUserProfileInfoUseCase {
    constructor(
        private userRepository: IUserRepository
    ) { };

    async execute(input: UpdateUserProfileInfoInput): Promise<UpdateUserProfileInfoOutput> {
        try {
            const { userId, username, phone } = input;
            if (!userId || !username || !phone) {
                throw new BadRequestError();
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            user.updateProfileInfo({
                phone: phone ?? undefined,
                username: username ?? undefined
            });

            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) {
                throw new AppError(
                    "Failed to update info",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            return { username: updatedUser.username, phone: updatedUser.phone };;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to update info");
        };
    };
};