export const safeDecode = (value?: string): string | undefined => {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
};
