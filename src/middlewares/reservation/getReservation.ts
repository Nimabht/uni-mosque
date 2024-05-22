import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/Classes/AppError";
import MySQLDriver from "../../db/mysql/connection";
import { RowDataPacket } from "mysql2";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reservationId = req.params.reservationId;
    const availableTimseUserCheck = req.availableTimseUserCheck;

    const query = `
      SELECT 
        r.id, r.user_id as reservedByUserId, r.description, r.tracking_code, r.status, 
        r.availableTime_id, r.created_at, r.updated_at, 
        at.start_date, at.end_date
      FROM reservations r
      JOIN available_times at ON r.availableTime_id = at.id
      WHERE r.id = ?
    `;
    const result = await MySQLDriver.queryAsync<RowDataPacket[]>(query, [
      reservationId,
    ]);

    if (result.length === 0) {
      const ex = AppError.notFound("Reservation not found.");
      return next(ex);
    }

    if (result[0].reservedByUserId !== availableTimseUserCheck) {
      const ex = AppError.Forbidden("Forbidden");
      return next(ex);
    }

    req.reservation = result[0];
    next();
  } catch (error: any) {
    const ex = AppError.internal(error.message);
    return next(ex);
  }
};
