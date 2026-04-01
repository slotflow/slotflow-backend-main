import chalk from "chalk";
import figlet from "figlet";
import { appConfig } from "../../config/env";

export const printText = () => {
    try {
        console.log(figlet.textSync("SLOTFLOW"));
        console.log(chalk.white("SERVICE : "), chalk.hex("#635bff").bold(appConfig.serviceName.toLowerCase));
    } catch (err) {
        console.log("Something went wrong...");
        console.error(err);
    }
}