// Security instance

import { JWTImpl } from "./jwt.service.impl";
import { PasswordHasherImpl } from "./passwordHashing.service.impl";
import { IJWT } from "../../application/interfaces/security/IJwt.service";
import { IPasswordHasher } from "../../application/interfaces/security/IPasswordHasher.service";

export const jwtService: IJWT = new JWTImpl();

export const passwordHasher: IPasswordHasher = new PasswordHasherImpl();