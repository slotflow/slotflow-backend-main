// passport stratergy instance

import { PassportStrategyImpl } from "./google.strategy";
import { IPassportStrategy } from "../../domain/interfaces/passport/IPassportStratergy";

export const passportStrategy: IPassportStrategy = new PassportStrategyImpl();