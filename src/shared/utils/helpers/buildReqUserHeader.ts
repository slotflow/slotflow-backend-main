import { AuthUser } from "../../../application/dtos/common.dto";

export const buildUserHeaders = (user: AuthUser): Record<string, string> => {
    const timeZoneStr = JSON.stringify(user.timeZone);
    return {
        "x-user-id": encodeURIComponent(user.id || ""),
        "x-user-role": encodeURIComponent(user.role || ""),
        "x-user-email": encodeURIComponent(user.email || ""),
        "x-user-name": encodeURIComponent(user.name || ""),
        "x-user-timezone": encodeURIComponent(timeZoneStr || ""),
    };
};  