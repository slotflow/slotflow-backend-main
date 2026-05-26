import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { DecodedUser } from "../../application/dtos/common.dto";

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as DecodedUser;
    if (!user || !user.role) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).send({ message: "Forbidden" });
    }

    next();
  };
};