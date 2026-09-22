import { GooglePassportStrategyImpl } from "./googlePassport.strategy.impl";
import { IGooglePassportStrategy } from "../../application/interfaces/passport/IGooglePassport.stratergy";

export const googlePassportStrategy: IGooglePassportStrategy = new GooglePassportStrategyImpl();