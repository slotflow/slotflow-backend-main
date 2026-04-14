import { log } from "../../../shared/logger/logger";
import { IJWT } from "../../../domain/interfaces/security/IJwt";
import { VerifyEmailRequest, VerifyEmailResponse } from "../../dtos/auth.dto";
import { IOTPService } from "../../../domain/interfaces/services/IOtp.service";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";

export class VerifyEmailUseCase {
    constructor(
        public readonly userRepository: IUserRepository,
        public readonly optService: IOTPService,
        public readonly jwtService: IJWT,
    ) { }

    async execute(input: VerifyEmailRequest): Promise<VerifyEmailResponse> {
        try {
            const { email } = input;

            const user = await this.userRepository.findByEmail(email);
            if (!user) throw new Error("Invalid credential");

            const token = await this.jwtService.generateToken({ userId: user._id, email: user.email });

            await this.optService.setOtp(email);

            return { token };
        } catch (error) {
            log.error("verifyEmailUseCase failed", error as Error);
            throw error;
        }
    }
}