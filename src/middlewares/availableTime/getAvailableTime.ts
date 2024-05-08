import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/Classes/AppError";
import MySQLDriver from "../../db/mysql/connection";
import { RowDataPacket } from "mysql2";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const availableTimeId = req.params.availableTimeId;

    const availableTimes = await MySQLDriver.queryAsync<RowDataPacket[]>(
      "SELECT * FROM available_times WHERE id= ?",
      [availableTimeId],
    );

    const availableTime = availableTimes[0];

    if (!availableTime) {
      const ex = AppError.notFound("Available time not found");
      return next(ex);
    }
    //@ts-ignore
    req.availableTime = availableTime;
    next();
  } catch (error: any) {
    const ex = AppError.internal(error.message);
    return next(ex);
  }
};
