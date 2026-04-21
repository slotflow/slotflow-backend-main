import { ERROR_CODES } from "../../../shared/utils/types";
import { IJWT } from "../../../domain/interfaces/security/IJwt";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { VerifyEmailInput, VerifyEmailOutput } from "../../dtos/auth.dto";
import { IOTPService } from "../../../domain/interfaces/services/IOtp.service";
import { BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";

export class VerifyEmailUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly optService: IOTPService,
        private readonly jwtService: IJWT,
    ) { }

    async execute(input: VerifyEmailInput): Promise<VerifyEmailOutput> {
        try {
            const { email } = input;
            if (!email) {
                throw new BadRequestError()
            }

            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                throw new NotFoundError(
                    "Invalid credential",
                    ERROR_CODES.INVALID_CREDENTIALS
                );
            }

            const token = await this.jwtService.generateToken({ userId: user._id, email: user.email });

            await this.optService.setOtp(email);

            return { token };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to verify email");
        }
    }
}