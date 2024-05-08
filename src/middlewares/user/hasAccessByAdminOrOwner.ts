import { Request, Response, NextFunction } from "express";
import AppError from "../../utils/Classes/AppError";

const hasAccessByAdminOrOwner = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, role } = req.tokenPayload;
  const { userId } = req.params;

  if (role === "Admin" || id === userId) {
    next();
  } else {
    const ex = AppError.Forbidden("Forbidden");
    next(ex);
  }
};

export default hasAccessByAdminOrOwner;
