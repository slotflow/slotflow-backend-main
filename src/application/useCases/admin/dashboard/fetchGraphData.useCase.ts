import { log } from "../../../../shared/logger/logger";

export class FetchGraphDataUseCase {
    constructor(
        
    ){ }

    async execute() : Promise<void> {
        try {
            
        } catch (error) {
            log.error("FetchGraphDataUseCase failed", error as Error);
            throw error;
        }
    }
}