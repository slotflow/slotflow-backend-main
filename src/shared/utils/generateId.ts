import { v4 as uuidv4 } from "uuid";
import { PREFIX_MAP } from "./constants";
import { AppError } from "../error/appError";
import { ERROR_CODES, IdType } from "./types";

export const generateId = (type: IdType): string => {
    const prefix = PREFIX_MAP[type];

    if (!prefix) {
        throw new AppError(
            `Invalid IdType: ${type}`,
            500,
            false,
            ERROR_CODES.INTERNAL_ERROR
        );
    }

    return `${prefix}${uuidv4()}`;
};