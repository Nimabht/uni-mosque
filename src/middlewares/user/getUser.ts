import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/Classes/AppError";
import MySQLDriver from "../../db/mysql/connection";
import { RowDataPacket } from "mysql2";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const users = await MySQLDriver.queryAsync<RowDataPacket[]>(
      "SELECT * FROM users WHERE id= ?",
      [userId],
    );

    const user = users[0];
    if (!user) {
      const ex = AppError.notFound("User not found");
      return next(ex);
    }
    const { password, ...filteredUser } = user;
    // @ts-ignore
    req.user = filteredUser;
    next();
  } catch (error: any) {
    const ex = AppError.internal(error.message);
    return next(ex);
  }
};
