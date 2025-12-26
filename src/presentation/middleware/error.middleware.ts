import { ZodError } from "zod";
import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (
    err,
    req,
    res,
    next
) => {
    console.log("ERROR:", err);

    if (err instanceof ZodError) {
        const message = err.errors.map(e => e.message).join(", ");
        res.status(400).json({ success: false, message });
        return;
    }

    if (err instanceof Error) {
        const status = (err as any).statusCode || 400;
        res.status(status).json({ success: false, message: err.message });
        return;
    }

    if ((err as any).name === "UnauthorizedError") {
        res.status(401).json({ success: false, message: "Unauthorized access." });
        return;
    }

    if ((err as any).name === "ForbiddenError") {
        res.status(403).json({ success: false, message: "Forbidden action." });
        return;
    }

    res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
};
