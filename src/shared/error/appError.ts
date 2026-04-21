import { ERROR_CODES } from "../utils/types";

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public isOperational: boolean = true,
        public errorCode?: ERROR_CODES
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = "Invalid Request", errorCode: ERROR_CODES = ERROR_CODES.INVALID_REQUEST) {
        super(message, 400, true, errorCode);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized Access", errorCode?: ERROR_CODES) {
        super(message, 401, true, errorCode);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = "Forbidden Action", errorCode?: ERROR_CODES) {
        super(message, 403, true, errorCode);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resource Not Found", errorCode?: ERROR_CODES) {
        super(message, 404, true, errorCode);
    }
}
