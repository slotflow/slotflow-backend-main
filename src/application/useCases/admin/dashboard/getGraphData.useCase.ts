import { toAppError } from "../../../../shared/error/handleUnknownError";

export class GetAdminGraphDataUseCase {
    constructor(
        
    ){ }

    async execute() : Promise<void> {
        try {
            
        } catch (error: unknown) {
            throw toAppError(error, "Failed to fetch graph data");
        }
    }
}