import { log } from "../../../../shared/logger/logger";

export class GetAdminGraphDataUseCase {
    constructor(
        
    ){ }

    async execute() : Promise<void> {
        try {
            
        } catch (error) {
            log.error("GetAdminGraphDataUseCase failed", error as Error);
            throw error;
        }
    }
}