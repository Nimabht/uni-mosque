import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/Classes/AppError";
import MySQLDriver from "../../db/mysql/connection";
import { RowDataPacket } from "mysql2";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const availableTimeId = req.params.availableTimeId;

    // Query to fetch available time info
    const availableTimes = await MySQLDriver.queryAsync<RowDataPacket[]>(
      "SELECT * FROM available_times WHERE id = ?",
      [availableTimeId],
    );

    const availableTime = availableTimes[0];

    if (!availableTime) {
      const ex = AppError.notFound("Available time not found");
      return next(ex);
    }

    // If reserved, fetch the associated reservation info
    if (availableTime.reserved === 1) {
      const reservations: any[] = await MySQLDriver.queryAsync<RowDataPacket[]>(
        "SELECT * FROM reservations WHERE availableTime_id = ?",
        [availableTimeId],
      );

      const reservation = reservations[0];
      if (reservation) {
        //@ts-ignore
        req.availableTime = {
          ...availableTime,
          reservation,
        };
        return next();
      }
    }

    // If not reserved, set only available time info
    //@ts-ignore
    req.availableTime = availableTime;
    next();
  } catch (error: any) {
    const ex = AppError.internal(error.message);
    return next(ex);
  }
};
