// Security instance

import { JWTImpl } from "./jwt..impl";
import { PasswordHasherImpl } from "./passwordHashing.impl";
import { IJWT } from "../../domain/interfaces/security/IJwt";
import { IPasswordHasher } from "../../domain/interfaces/security/IPasswordHasher";

export const jwtService: IJWT = new JWTImpl();

export const passwordHasher: IPasswordHasher = new PasswordHasherImpl();