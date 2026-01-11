import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/role.enum";
import { NextFunction, Request, Response } from "express";
import { DecodedUser } from "../../application/dtos/common.dto";
import { providerRepository, userRepository } from "../../infrastructure/repositoryImpls";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

  try {

    const userId = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];

    if (!userId || !role) {
      console.log("One");
      res.status(401).json({ success: false, message: "Unauthenticated request" });
      return;
    }

    const normalizedUserId = Array.isArray(userId) ? userId[0] : userId;
    const normalizedRole = Array.isArray(role) ? role[0] as Role : role as Role;

    req.user = {
      userOrProviderId: normalizedUserId,
      role: normalizedRole
    } as DecodedUser;

    if (req.user.role === Role.User) {
      const user = await userRepository.findById(req.user.userOrProviderId!);
      if (user?.isBlocked) {
        console.log("two");
        res.status(403).json({ success: false, message: "Your account is blocked" });
        return;
      }
    }

    if (req.user.role === Role.Provider) {
      const provider = await providerRepository.findById(req.user.userOrProviderId!);
      if (provider?.isBlocked) {
        console.log("Provider blocked");
        console.log("three");
        res.status(403).json({ success: false, message: "Your account is blocked" });
        return;
      }
    }

    next();
  } catch (error) {
    console.log("four");
    log.error("error", error as Error);
    res.status(401).json({ success: false, message: "Unauthorized: Invalid token." });
  }
};