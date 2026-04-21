import bcrypt from 'bcryptjs';
import { log } from '../../shared/logger/logger';
import { ERROR_CODES } from '../../shared/utils/types';
import { AppError, BadRequestError } from '../../shared/error/appError';
import { IPasswordHasher } from '../../domain/interfaces/security/IPasswordHasher';

export class PasswordHasherImpl implements IPasswordHasher {

  async hashPassword(password: string): Promise<string> {
    try {
      if (!password) {
        throw new BadRequestError(
          "Password is required",
          ERROR_CODES.INVALID_REQUEST
        );
      }
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      log.error("hashPassword failed : ", error as Error);

      throw new AppError(
        "Password hashing failed",
        500,
        false,
        ERROR_CODES.PASSWORD_HASH_FAILED
      );
    };
  };

  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      if (!plainPassword || !hashedPassword) {
        throw new BadRequestError(
          "Password required",
          ERROR_CODES.INVALID_REQUEST
        );
      }
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      log.error("comparePassword failed : ", error as Error)

      throw new AppError(
        "Password comparison failed",
        500,
        false,
        ERROR_CODES.PASSWORD_COMPARE_FAILED
      );
    };
  };

}
