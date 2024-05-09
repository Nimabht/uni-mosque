import { Request, Response, NextFunction } from "express";
import AppError from "../utils/Classes/AppError";
import MySQLDriver from "../db/mysql/connection";
import { RowDataPacket } from "mysql2";
import moment from "moment";
import {
  validateAvailableTimesQuery,
  validateCreateNewAvailableTimeBody,
  validateUpdateAvailableTimeBody,
} from "../validators/availableTime";

class AvailableTimeController {
  async getAllAvailableTime(req: Request, res: Response, next: NextFunction) {
    const { value, error } = validateAvailableTimesQuery(req.query);
    if (!!error) {
      const ex = AppError.badRequest(error.toString());
      return next(ex);
    }

    let { date_from, date_to } = req.query;

    if (!date_from || !date_to) {
      const currentDate = moment();

      // Calculate the start of the current month
      date_from = currentDate.clone().startOf("month").format("YYYY-MM-DD");

      // Calculate the end of the current month
      date_to = currentDate.clone().endOf("month").format("YYYY-MM-DD");
    }
    let query = `
    SELECT * FROM available_times 
    WHERE start_date >= ? AND end_date <= ?
    `;
    let result: any[] = await MySQLDriver.queryAsync<RowDataPacket[]>(query, [
      date_from,
      date_to,
    ]);

    res.json({
      data: result,
      date_from,
      date_to,
    });
  }

  async createAvailableTime(req: Request, res: Response, next: NextFunction) {
    const { error, value } = validateCreateNewAvailableTimeBody(req.body);

    if (!!error) {
      const ex = AppError.badRequest(error.toString());
      return next(ex);
    }
    const { start_date, end_date, price, description } = value;
    // Check for conflicts
    const conflictQuery = `
      SELECT * FROM available_times 
      WHERE 
        (start_date <= ? AND end_date >= ?) OR
        (start_date <= ? AND end_date >= ?) OR
        (start_date >= ? AND end_date <= ?)
    `;

    const conflictCheckResult = await MySQLDriver.queryAsync<RowDataPacket[]>(
      conflictQuery,
      [start_date, start_date, end_date, end_date, start_date, end_date],
    );

    if (conflictCheckResult.length > 0) {
      // Conflict found, return an error
      const ex = AppError.Forbidden("Conflict with existing available time");
      return next(ex);
    }

    const result: any = await MySQLDriver.queryAsync<RowDataPacket[]>(
      `INSERT INTO available_times (start_date,end_date,price,description) VALUES (?, ? , ? , ?)`,
      [start_date, end_date, price, description],
    );

    if (result.affectedRows !== "0") {
      res.status(201).end();
    } else {
      const ex = AppError.internal("");
      return next(ex);
    }
  }

  async deleteAvailableTime(req: Request, res: Response, next: NextFunction) {
    const availableTime = req.availableTime;

    if (availableTime?.reserved === 1) {
      const ex = AppError.Forbidden("This available time has beed reserved.");
      return next(ex);
    }

    const query = `
    DELETE FROM available_times WHERE id = ?
    `;
    await MySQLDriver.queryAsync(query, [availableTime?.id]);
    res.status(204).end();
  }
  async updateAvailableTime(req: Request, res: Response, next: NextFunction) {
    const { error, value } = validateUpdateAvailableTimeBody(req.body);
    const availableTime = req.availableTime;

    if (!!error) {
      const ex = AppError.badRequest(error.toString());
      return next(ex);
    }

    let { price, description } = value;

    if (availableTime?.reserved === 1) {
      const ex = AppError.Forbidden(
        "This available time has been reserved and cannot be updated.",
      );
      return next(ex);
    }

    // Update only the updatable fields
    const updateFields = {
      price,
      description,
    };

    const updateQuery = `
      UPDATE available_times 
      SET ? 
      WHERE id = ?
    `;

    const result: any = await MySQLDriver.queryAsync<RowDataPacket[]>(
      updateQuery,
      [updateFields, availableTime?.id],
    );

    if (result.changedRows !== "0") {
      res.status(200).json({ message: "Available time updated successfully" });
    } else {
      const ex = AppError.internal("");
      return next(ex);
    }
  }
}

const availableTimeController = new AvailableTimeController();
export default availableTimeController;
