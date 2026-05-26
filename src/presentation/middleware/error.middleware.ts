import { ZodError } from "zod";
import { log } from "../../shared/logger/logger";
import { AppError } from "../../shared/error/appError";
import { ERROR_CODES } from "../../shared/utils/types";
import { NextFunction, Request, Response } from "express";
import { isNamedError } from "../../shared/utils/isNameError";

export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = "Something went wrong";
    let success = false;
    let errors: unknown = undefined;
    let errorCode: string = ERROR_CODES.INTERNAL_ERROR;

    if (err instanceof ZodError) {
        statusCode = 400;
        message = "Validation failed";
        errors = err.issues;
        errorCode = ERROR_CODES.VALIDATION_ERROR;

        log.warn(`[Validation Error] ${req.method} ${req.url}`);
    }

    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        errorCode = err.errorCode || ERROR_CODES.INTERNAL_ERROR;

        message = err.isOperational
            ? err.message
            : "Something went wrong";

        if (err.isOperational) {
            log.warn(
                `[Operational Error] ${req.method} ${req.url} - ${err.message}`
            );
        } else {
            log.error(
                `[System Error] ${req.method} ${req.url}`,
                err
            );
        }
    }

    else if (isNamedError(err)) {
        if (err.name === "UnauthorizedError") {
            statusCode = 401;
            message = "Unauthorized access";
            errorCode = ERROR_CODES.UNAUTHORIZED;
        } else if (err.name === "ForbiddenError") {
            statusCode = 403;
            message = "Forbidden action";
        }

        log.warn(
            `[Named Error] ${req.method} ${req.url} - ${err.name}`
        );
    }

    else {
        log.error(
            `[Unexpected Error] ${req.method} ${req.url}`,
            err as Error
        );
    }

    res.status(statusCode).json({
        success,
        message,
        errorCode,
        errors,
        ...(process.env.NODE_ENV === "development" &&
        err instanceof Error
            ? { stack: err.stack }
            : {}),
    });
};