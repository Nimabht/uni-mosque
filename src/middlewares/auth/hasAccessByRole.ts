import { Request, Response, NextFunction } from "express";
import AppError from "../../utils/Classes/AppError";

export default function hasAccessByRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const tokenPayload = req.tokenPayload;
    const userRole = tokenPayload.role;

    // Check if the user's role is included in the allowedRoles array
    if (allowedRoles.includes(userRole)) {
      return next();
    }

    const ex = AppError.Forbidden("You do not have access to this resource");
    return next(ex);
  };
}
