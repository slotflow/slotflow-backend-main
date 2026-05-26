import { JwtClaims } from "../../commands/jwt.commands";

export interface IJWT {

  generateToken(input: JwtClaims,expiresIn?: string): Promise<string>;

  verifyToken(token: string): Promise<JwtClaims>;

};
