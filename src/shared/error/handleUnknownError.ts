import { AppError } from "./appError";
import { ERROR_CODES } from "../utils/types";

export function toAppError(
    error: unknown,
    fallbackMessage = "Unexpected error occurred"
): AppError {
    if (error instanceof AppError) {
        return error;
    }

    if (error instanceof Error) {
        return new AppError(
            error.message,
            500,
            false,
            ERROR_CODES.INTERNAL_ERROR
        );
    }

    return new AppError(
        fallbackMessage,
        500,
        false,
        ERROR_CODES.INTERNAL_ERROR
    );
}