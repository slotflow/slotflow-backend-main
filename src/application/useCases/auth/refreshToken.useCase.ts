import { AccessTokenClaims } from "../../dtos/common.dto";
import { UnauthorizedError } from "../../../shared/error/appError";
import { IAuthTokenService } from "../../interfaces/security/IAuthToken.service";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";

export class RefreshTokenUseCase {
  constructor(
    private readonly authTokenService: IAuthTokenService,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(refreshToken: string): Promise<string> {
    const userId = await this.authTokenService.verifyRefreshToken(refreshToken);

    const user = await this.userRepository.findById(userId);

    if (!user || user.isBlocked) {
      throw new UnauthorizedError("User not found or blocked");
    }

    const claims: AccessTokenClaims = {
      userId: String(user._id),
      email: user.email,
      name: user.username ?? user.email.split("@")[0],
      role: user.role,
      timeZone: user.timeZone,
    };

    return this.authTokenService.refreshAccessToken(claims);
  }
}
