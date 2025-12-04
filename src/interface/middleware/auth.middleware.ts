import { DecodedUser } from "../../express"; 
import { NextFunction, Request, Response } from "express";
import { JWTService } from "../../infrastructure/security/jwt";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { roleArray } from "../../utils/constants";
import { Types } from "mongoose";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";

const userRepositoryImpl = new UserRepositoryImpl();
const providerRepositoryImpl = new ProviderRepositoryImpl();

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
      const user = await userRepositoryImpl.findUserById(new Types.ObjectId(req.user.userOrProviderId));
      if(user?.isBlocked) {
        res.status(403).json({ success: false, message: "Your account is blocked"} );
        return;
      }
    }

    if(req.user.role === roleArray[2]) {
      const provider = await providerRepositoryImpl.findProviderById(new Types.ObjectId(req.user.userOrProviderId));
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