import { log } from "../../../../shared/logger/logger";

export class GetGraphDataUseCase {
    constructor(
        
    ){ }

    async execute() : Promise<void> {
        try {
            
        } catch (error) {
            log.error("GetGraphDataUseCase failed", error as Error);
            throw error;
        }
    }
}