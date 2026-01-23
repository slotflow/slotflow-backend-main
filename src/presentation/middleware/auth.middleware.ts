import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { cacheService } from "../../infrastructure/services";
import { DecodedUser } from "../../application/dtos/common.dto";
import { providerRepository, userRepository } from "../../infrastructure/repositoryImpls";
import { Role } from "../../domain/enums/common.enum";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const userId = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];

    if (role !== Role.ADMIN && !userId) {
      res.status(401).json({ success: false, message: "Unauthenticated request" });
      return;
    };

    const normalizedUserId = Array.isArray(userId) ? userId[0] : userId;
    const normalizedRole = Array.isArray(role)
      ? (role[0] as Role)
      : (role as Role);

    req.user = {
      userOrProviderId: normalizedUserId,
      role: normalizedRole,
    } as DecodedUser;

    // User auth
    if (req.user.role === Role.USER) {
      const cacheKey = req.user.userOrProviderId!;
      const cachedStatus = await cacheService.getBlockList(cacheKey);

      if (cachedStatus !== null) {
        if (cachedStatus === "true") {
          res.status(403).json({ success: false, message: "Your account is blocked" });
          return;
        };
        return next();
      };

      // Cache miss DB fallback
      const user = await userRepository.findById(cacheKey);
      if (!user) {
        res.status(401).json({ success: false, message: "Invalid user" });
        return;
      };

      await cacheService.setBlockList(
        cacheKey,
        JSON.stringify(user.isBlocked)
      );

      if (user.isBlocked) {
        res.status(403).json({ success: false, message: "Your account is blocked" });
        return;
      };
    };

    // Provider auth
    if (req.user.role === Role.PROVIDER) {
      const cacheKey = req.user.userOrProviderId!;
      const cachedStatus = await cacheService.getBlockList(cacheKey);

      if (cachedStatus !== null) {
        if (cachedStatus === "true") {
          res.status(403).json({ success: false, message: "Your account is blocked" });
          return;
        };
        return next();
      };

      // Cache miss DB fallback
      const provider = await providerRepository.findById(cacheKey);
      if (!provider) {
        res.status(401).json({ success: false, message: "Invalid provider" });
        return;
      };

      await cacheService.setBlockList(
        cacheKey,
        JSON.stringify(provider.isBlocked)
      );

      if (provider.isBlocked) {
        res.status(403).json({ success: false, message: "Your account is blocked" });
        return;
      };
    };

    next();
  } catch (error) {
    log.error("error", error as Error);
    res.status(401).json({ success: false, message: "Unauthorized: Invalid token." });
    return;
  };
};