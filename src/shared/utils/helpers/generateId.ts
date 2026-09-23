import { v4 as uuidv4 } from "uuid";
import { GenerateId } from "../types/types";
import { AppError } from "../../error/appError";
import { PREFIX_MAP } from "../constants/constant";
import { generateBase62 } from "./generateRnadomStr";
import { ERROR_CODES, IdType } from "../types/enums";

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

        const formattedName = name.trim()
        .split(" ")[0]
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0,8)
        .toUpperCase();
        const randomPart = generateBase62(7);

        return `${prefix}${formattedName}${randomPart}`;
    }

    return `${prefix}${uuidv4()}`;
};