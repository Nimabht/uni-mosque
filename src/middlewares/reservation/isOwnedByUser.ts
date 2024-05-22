import { Request, Response, NextFunction } from "express";
import AppError from "../../utils/Classes/AppError";

const isOwnedByUser = (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = req.tokenPayload;
  const id = req.params.userId;

  if (role === "Admin") {
    next();
  } else if (role === "User") {
    const availableTimseUserCheck = userId;
    req.availableTimseUserCheck = availableTimseUserCheck;
  } else {
    const ex = AppError.Forbidden("Forbidden");
    next(ex);
  }
};

export default isOwnedByUser;
