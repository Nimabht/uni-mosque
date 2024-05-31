import { Request, Response, NextFunction } from "express";
import AppError from "../../utils/Classes/AppError";

const hasAccessByAdminOrOwner = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId, role } = req.tokenPayload;
  const commetId = req.params.commentId;

  if (role === "Admin" || commetId == userId) {
    next();
  } else {
    const ex = AppError.Forbidden("Forbidden");
    next(ex);
  }
};

export default hasAccessByAdminOrOwner;
