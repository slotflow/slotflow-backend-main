import { Types } from "mongoose";
import { DecodedUser } from "../../express"; 
import { roleArray } from "../../shared/utils/constants";
import { NextFunction, Request, Response } from "express";
import { JWTService } from "../../infrastructure/security/jwt";
import { IUserRepository } from "../../domain/interfaces/repositories/IUser.repository";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { IProviderRepository } from "../../domain/interfaces/repositories/IProvider.repository";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";

const userRepository: IUserRepository = new UserRepositoryImpl();
const providerRepository: IProviderRepository = new ProviderRepositoryImpl();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  const currentTime = Date.now();

  if (!token) {
    res.status(401).json({ success: false, message: "Unauthorized, no token." });
    return;
  } 

  try {
    const decoded = JWTService.verifyToken(token);
    if (decoded && decoded.exp && currentTime > decoded.exp * 1000) {
      console.log("token expired");
      res.status(401).json({ success: false, message: "Unauthorized: Token expired." });
      return;
    }

    req.user = decoded as DecodedUser;
    if(req.user.role === roleArray[1]) {
      const user = await userRepository.findUserById(new Types.ObjectId(req.user.userOrProviderId));
      if(user?.isBlocked) {
        res.status(403).json({ success: false, message: "Your account is blocked"} );
        return;
      }
    }

    if(req.user.role === roleArray[2]) {
      const provider = await providerRepository.findById(req.user.userOrProviderId);
      if(provider?.isBlocked) {
        console.log("Provider blocked");
        res.status(403).json({ success: false, message: "Your account is blocked" } );
        return;
      }
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized: Invalid token." });
  }
};