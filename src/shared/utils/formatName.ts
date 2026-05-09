export const formatName = (name: string): string => {
    return name
        .trim()
        .split(" ")[0]
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
};