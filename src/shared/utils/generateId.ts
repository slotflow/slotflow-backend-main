import { v4 as uuidv4 } from "uuid";
import { PREFIX_MAP } from "./constants";
import { formatName } from "./formatName";
import { AppError } from "../error/appError";
import { generateBase62 } from "./generateRefString";
import { ERROR_CODES, GenerateId, IdType } from "./types";

export const generateId = (input: GenerateId): string => {
    const { type, options } = input;
    const prefix = PREFIX_MAP[type];

    if (!prefix) {
        throw new AppError(
            `Invalid IdType: ${type}`,
            500,
            false,
            ERROR_CODES.INTERNAL_ERROR
        );
    }

    if (type === IdType.REFERRAL) {
        const name = options?.name;

        if (!name?.trim()) {
            throw new AppError(
                "Referral name is required",
                400,
                false,
                ERROR_CODES.INVALID_REQUEST
            );
        }

        const formattedName = formatName(name);
        const randomPart = generateBase62(7);

        return `${prefix}${formattedName}${randomPart}`;
    }

    return `${prefix}${uuidv4()}`;
};