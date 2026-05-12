import mongoose from "mongoose";
import { ERROR_CODES } from "../../../shared/utils/types";
import { CreateAddressInput } from "../../dtos/address.dto";
import { Address } from "../../../domain/entities/address.entity";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IAddressRepository } from "../../../domain/interfaces/repositories/IAddress.repository";

export class UserCreateAddressUseCase {
    constructor(
        private userRepository: IUserRepository,
        private addressRepository: IAddressRepository,
    ) { };

    async execute(input: CreateAddressInput): Promise<void> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { userId, ...addressData } = input;
            if (!userId || !addressData) {
                throw new BadRequestError(
                    "Invalid Request",
                    ERROR_CODES.INVALID_REQUEST
                );
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            const address = Address.create({ userId, ...addressData });
            const savedAddress = await this.addressRepository.create(address, session);
            if (!savedAddress) {
                throw new AppError(
                    "Failed to create address",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            user.attachAddress(savedAddress._id)
            const updatedUser = await this.userRepository.update(user, session);
            if (!updatedUser) {
                throw new AppError(
                    "Failed to attach address",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }
            await session.commitTransaction();
        } catch (error: unknown) {
            await session.abortTransaction();
            throw toAppError(error, "Failed to create address");
        } finally {
            session.endSession();
        }
    }
};