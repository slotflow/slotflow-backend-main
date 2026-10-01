import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { ERROR_CODES } from "../../shared/utils/types/enums";
import { cacheService } from "../../infrastructure/services";
import { AuthUser } from "../../application/dtos/common.dto";
import { TimeZone } from "../../domain/commands/user.commands";
import { userRepository } from "../../infrastructure/repository";
import { ForbiddenError, UnauthorizedError } from "../../shared/error/appError";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];
    const name = req.headers["x-user-name"];
    const email = req.headers["x-user-email"];
    const timeZone = req.headers["x-user-timezone"];

    const normalizedUserId = Array.isArray(userId) ? userId[0] : userId;
    const normalizedRole = Array.isArray(role) ? (role[0] as Role) : (role as Role);
    const normalizedName = Array.isArray(name) ? (name[0] as string) : name;
    const normalizedEmail = Array.isArray(email) ? (email[0] as string) : email;
    let normalizedTimeZone: TimeZone | string | undefined;
    const rawTimeZone = Array.isArray(timeZone) ? timeZone[0] : timeZone;

    if (rawTimeZone) {
      try {
        normalizedTimeZone = JSON.parse(rawTimeZone) as TimeZone;
      } catch {
        normalizedTimeZone = rawTimeZone as unknown as TimeZone;
      }
    }

    if (!normalizedUserId || !normalizedRole || !normalizedName || !normalizedEmail || !normalizedTimeZone) {
      return next(
        new UnauthorizedError(
          "Invalid user identity headers",
          ERROR_CODES.USER_NOT_FOUND
        )
      );
    }

    const decodedUser: AuthUser = {
      id: normalizedUserId,
      role: normalizedRole,
      name: normalizedName,
      email: normalizedEmail,
      timeZone: normalizedTimeZone as TimeZone
    };

    req.user = decodedUser;

    const cacheKey = decodedUser.id;
    const cachedStatus = await cacheService.getBlockList(cacheKey);

    if (cachedStatus !== null) {
      if (cachedStatus === "true") {
        return next(
          new ForbiddenError(
            "Your account is blocked",
            ERROR_CODES.FORBIDDEN
          )
        );
      };
      return next();
    };

    // Cache miss DB fallback
    const user = await userRepository.findById(cacheKey);
    if (!user) {
      return next(
        new UnauthorizedError(
          "Invalid user",
          ERROR_CODES.USER_NOT_FOUND
        )
      );
    };

    await cacheService.setBlockList(
      cacheKey,
      JSON.stringify(user.isBlocked)
    );

    if (user.isBlocked) {
      return next(
        new ForbiddenError(
          "Your account is blocked",
          ERROR_CODES.FORBIDDEN
        )
      );
    };

    next();
  } catch (error) {
    log.error("error", error as Error);
    return next(
      new UnauthorizedError(
        "Unauthorized: Invalid token",
        ERROR_CODES.TOKEN_INVALID
      )
    );
  };
};