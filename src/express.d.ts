import { Role } from "./domain/enums/role.enum";
import { DecodedUser } from "./application/dtos/common.dto";

// Extend the Request interface
declare global {
    namespace Express {
        interface User extends DecodedUser { }
        interface Request {
            user: User;
        };
    };
};

