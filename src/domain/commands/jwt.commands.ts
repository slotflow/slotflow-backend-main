import { Role } from "../enums/common.enum";

export interface JwtClaims {
  userId?: string;
  email?: string;
  username?: string;
  password?: string;
  role?: Role;
  iat?: number;
  exp?: number;
}
