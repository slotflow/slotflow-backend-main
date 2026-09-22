import { JwtClaims } from "../../dtos/common.dto";

export interface IJWT {

  generateToken(input: JwtClaims, expiresIn?: string): Promise<string>;

  verifyToken(token: string): Promise<JwtClaims>;

};
