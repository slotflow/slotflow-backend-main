import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { ERROR_CODES } from "../../shared/utils/types";
import { NextFunction, Request, Response } from "express";
import { cacheService } from "../../infrastructure/services";
import { DecodedUser } from "../../application/dtos/common.dto";
import { userRepository } from "../../infrastructure/repositoryImpls";
import { ForbiddenError, UnauthorizedError } from "../../shared/error/appError";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];

    const normalizedUserId = Array.isArray(userId) ? userId[0] : userId;
    const normalizedRole = Array.isArray(role)
      ? (role[0] as Role)
      : (role as Role);

    req.user = {
      id: normalizedUserId,
      role: normalizedRole,
    } as DecodedUser;

    const cacheKey = req.user.id!;
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