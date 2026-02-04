import { Response } from "express";

export const sendResponse = <T>(
  res: Response,
  data: T,
  message = "Success",
  success = true,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};
