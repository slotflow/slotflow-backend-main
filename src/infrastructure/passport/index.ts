import { GooglePassportStrategyImpl } from "./google.strategy";
import { IGooglePassportStrategy } from "../../domain/interfaces/passport/IGooglePassportStratergy";

export const googlePassportStrategy: IGooglePassportStrategy = new GooglePassportStrategyImpl();