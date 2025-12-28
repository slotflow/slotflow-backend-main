import { DecodedUser } from "../../express";
import { Role } from "../../domain/enums/role.enum";
// import { roleArray } from "../../shared/utils/constants";
import { NextFunction, Request, Response } from "express";
// import { JWTService } from "../../infrastructure/security/jwt";
import { IUserRepository } from "../../domain/interfaces/repositories/IUser.repository";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { IProviderRepository } from "../../domain/interfaces/repositories/IProvider.repository";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { log } from "../../shared/logger/logger";

const userRepository: IUserRepository = new UserRepositoryImpl();
const providerRepository: IProviderRepository = new ProviderRepositoryImpl();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

  // const token = req.cookies.token;
  // const currentTime = Date.now();

  // if (!token) {
  //   res.status(401).json({ success: false, message: "Unauthorized, no token." });
  //   return;
  // } 

  try {
    // const decoded = JWTService.verifyToken(token);
    // if (decoded && decoded.exp && currentTime > decoded.exp * 1000) {
    //   console.log("token expired");
    //   res.status(401).json({ success: false, message: "Unauthorized: Token expired." });
    //   return;
    // }

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
      const user = await userRepository.findById(req.user.userOrProviderId);
      if (user?.isBlocked) {
        console.log("two");
        res.status(403).json({ success: false, message: "Your account is blocked" });
        return;
      }
    }

    if (req.user.role === Role.Provider) {
      const provider = await providerRepository.findById(req.user.userOrProviderId);
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
    log.error("error : ",error as Error);
    res.status(401).json({ success: false, message: "Unauthorized: Invalid token." });
  }
};