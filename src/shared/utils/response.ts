import { Response } from "express";

export const sendResponse = <T>(
  res: Response,
  data: T,
  message: string = "Success",
  success: boolean = true,
  statusCode: number = 200
) => {
  console.log("json : ",{
    success,
    message,
    data
  })
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};
