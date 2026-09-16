import { Role } from "./domain/enums/role.enum";
import { AuthUser } from "./application/dtos/common.dto";

// Extend the Request interface
declare global {
    namespace Express {
        interface User extends AuthUser, Partial<GoogleOAuthUser> { }

        interface Request {
            user: User;
        }
    };
};

