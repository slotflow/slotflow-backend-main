import { JwtClaims } from "../../commands/jwt.commands";

export interface IJWT {

  generateToken(payload: JwtClaims,expiresIn?: string): Promise<string>;

  verifyToken(token: string): Promise<JwtClaims>;

};
