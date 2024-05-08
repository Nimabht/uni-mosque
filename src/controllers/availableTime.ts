import { Request, Response, NextFunction } from "express";
// import { User } from "../models/user";
// import validators from "../validators/user";
import AppError from "../utils/Classes/AppError";
import { join } from "path";
import { promises as fsPromises } from "fs";
import userSearch from "../utils/Helpers/user/userSearchQuery";
import MySQLDriver from "../db/mysql/connection";
import { RowDataPacket } from "mysql2";
import { validateUserForUpdate } from "../validators/user";
import resizeUserAvatar from "../utils/imageResizer/resizeUserAvatar";
import moment from "moment";
import {
  validateAvailableTimesQuery,
  validateCreateNewAvailableTimeBody,
} from "../validators/availableTime";
// import resizeUserAvatar from "../utils/resizeImage/resizeUserAvatar";
// import { Article } from "../models/article";
// import articleRemover from "../utils/articleRemover";
// import { Comment } from "../models/comment";
// import userSearch from "../utils/userSearch";
// import paginate from "../utils/pagination";

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
    const { start_date, end_date } = value;
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
      `INSERT INTO available_times (start_date,end_date) VALUES (?, ?)`,
      [start_date, end_date],
    );

    console.log(result);

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
}

const availableTimeController = new AvailableTimeController();
export default availableTimeController;
