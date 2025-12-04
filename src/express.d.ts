import { Request } from "express";
import { RoleType } from "./infrastructure/dtos/common.dto";

export interface DecodedUser {
    userOrProviderId: string;
    role: RoleType;
    exp: number;
    iat: number;
}

// Extend the Request interface
declare global {
    namespace Express {
        interface Request {
            user: DecodedUser;
        }
    }
}