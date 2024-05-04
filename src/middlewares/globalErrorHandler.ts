// import { createLogger, transports, format, Logger, error } from "winston";
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/Classes/AppError";

export default (
  Error: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  //logging server side errors (5XX)
  if (!Error.statusCode || Error.statusCode.toString().startsWith("5")) {
    console.error(Error.message);
  }

  //logging client side errors (4XX)
  if (!Error.statusCode || Error.statusCode.toString().startsWith("4")) {
    console.log(
      `Responded to ${req.method} request to ${req.originalUrl} With IP: ${req.ip} with data: ${Error.message}`,
    );
  }

  //handling server side errors (5XX || 4XX)
  res.status(Error.statusCode);
  res.send({
    error: Error.status || "error",
    message: Error.statusCode.toString().startsWith("5")
      ? "Internal Server Error"
      : Error.message,
  });
};
