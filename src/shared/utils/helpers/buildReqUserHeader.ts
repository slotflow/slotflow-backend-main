import { AuthUser } from "../../../application/dtos/common.dto";

export const buildUserHeaders = (user: AuthUser): Record<string, string> => {
    return {
        "x-user-id": user.id,
        "x-user-role": user.role,
        "x-user-email": encodeURIComponent(user.email || ""),
        "x-user-name": encodeURIComponent(user.name || ""),
    };
};