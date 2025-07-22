export const generateRandomString = (length: number = 10): string => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        const randomIndex: number = Math.floor(Math.random() * chars.length);
        result += chars.charAt(randomIndex);
    }
    return result;
};
