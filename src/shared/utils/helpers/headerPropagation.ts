import { Request } from "express";
import { Role } from "../../../domain/enums/common.enum";
import { AuthUser } from "../../../application/dtos/common.dto";

export const buildUserHeaders = (user: AuthUser): Record<string, string> => {
    return {
        "x-user-id": user.id,
        "x-user-role": user.role,
        "x-user-email": encodeURIComponent(user.email || ""),
        "x-user-name": encodeURIComponent(user.name || ""),
    };
};

export const extractUserHeaders = (req: Request): AuthUser | null => {
    const id = req.headers["x-user-id"] as string;
    const role = req.headers["x-user-role"] as Role;
    const email = req.headers["x-user-email"] as string;
    const name = req.headers["x-user-name"] as string;

    if (!id || !email) {
        return null;
    }

    return {
        id,
        role,
        email: decodeURIComponent(email),
        name: decodeURIComponent(name),
    };
};