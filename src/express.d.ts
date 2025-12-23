import { Request } from "express";
import { Role } from "./domain/enums/role.enum";

export interface DecodedUser {
    userOrProviderId: string;
    role: Role;
    exp?: number;
    iat?: number;
};

// Extend the Request interface
declare global {
    namespace Express {
        interface Request {
            user: DecodedUser;
        }
    }
}