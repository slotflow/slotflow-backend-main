import { v4 as uuidv4 } from "uuid";

const BASE36 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const generateBase62 = (length: number): string => {
  let result = "";
  const uuid = uuidv4().replace(/-/g, "");

  for (let i = 0; i < length; i++) {
    const index = parseInt(uuid.substr(i * 2, 2), 16) % BASE36.length;
    result += BASE36[index];
  }

  return result;
};
