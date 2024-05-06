import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../../utils/Classes/AppError";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const ex = AppError.unAuthorized("Unauthorized");
      return next(ex);
    }
    const token = authHeader.split(" ")[1];

    if (!process.env.SECRET_KEY) {
      console.error("JWT SECRET_KEY not found!");
      process.exit(1);
    }

    const payload = jwt.verify(token, process.env.SECRET_KEY);

    if (typeof payload == "string") {
      const ex = AppError.unAuthorized("Invalid Token");
      return next(ex);
    }

    req.tokenPayload = payload;

    next();
  } catch (error: any) {
    const ex = AppError.unAuthorized("Invalid Token");
    return next(ex);
  }
};
