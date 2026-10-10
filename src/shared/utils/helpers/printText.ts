import chalk from "chalk";
import figlet from "figlet";
import { log } from "../../logger/logger";
import { appConfig } from "../../../config/env";

export const printText = () => {
  try {
    console.log(figlet.textSync("SLOTFLOW"));
    console.log(
      chalk.white("SERVICE : "),
      chalk.hex("#635bff").bold(appConfig.serviceName.toUpperCase()),
    );
  } catch (error) {
    log.error("print text error : ", { error });
  }
};
