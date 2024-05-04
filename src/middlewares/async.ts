import { NextFunction, Request, Response } from "express";
import AppError from "../utils/Classes/AppError";

export default function asyncMiddleware(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error: any) {
      const ex = AppError.internal(error.message);
      return next(ex);
    }
  };
}
