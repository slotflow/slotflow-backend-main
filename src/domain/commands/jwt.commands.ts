import { JwtPayload } from "jsonwebtoken";
import { Role } from "../enums/common.enum";

export interface JwtClaims extends JwtPayload {
  userId?: string;
  email?: string;
  name?: string;
  password?: string;
  role?: Role;
}
