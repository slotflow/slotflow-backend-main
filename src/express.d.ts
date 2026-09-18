import { Role } from "./domain/enums/role.enum";
import { AuthUser, GoogleOAuthUser } from "./application/dtos/common.dto";

// Extend the Request interface
declare global {
    namespace Express {
        interface User extends Partial<AuthUser>, Partial<GoogleOAuthUser> { }

        interface Request {
            user: User;
        }
    };
};

