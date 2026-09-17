// helper function to check if an error is a named error
export function isNamedError(err: unknown): err is { name: string } {
    return typeof err === "object" && err !== null && "name" in err;
}