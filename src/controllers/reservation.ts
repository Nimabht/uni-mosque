import { Request, Response, NextFunction } from "express";
import MySQLDriver from "../db/mysql/connection";
import { RowDataPacket } from "mysql2";
import AppError from "../utils/Classes/AppError";

class ReservationController {
  // Get all reservations with optional pagination and date range filters
  async getAllReservations(req: Request, res: Response, next: NextFunction) {
    let { page, per_page, available_time_date_from, available_time_date_to } =
      req.query;

    // Set default values for pagination if not provided
    const pageNum = parseInt(page as string) || 1;
    const pageSize = parseInt(per_page as string) || 10;
    const startIndex = (pageNum - 1) * pageSize;

    let query = `
      SELECT 
        r.id, r.user_id, r.description, r.tracking_code, r.status, 
        r.availableTime_id, r.created_at, r.updated_at, 
        at.start_date, at.end_date
      FROM reservations r
      JOIN available_times at ON r.availableTime_id = at.id
    `;

    const queryParams: any[] = [];

    // Build query conditions based on provided filters
    const conditions: string[] = [];
    if (available_time_date_from) {
      conditions.push("at.start_date >= ?");
      queryParams.push(available_time_date_from);
    }
    if (available_time_date_to) {
      conditions.push("at.end_date <= ?");
      queryParams.push(available_time_date_to);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Execute the main query to get all results based on filters
    const allResults = await MySQLDriver.queryAsync<RowDataPacket[]>(
      query,
      queryParams,
    );

    // Implement pagination
    query += ` LIMIT ?, ?`;
    queryParams.push(startIndex, pageSize);

    const paginatedResults = await MySQLDriver.queryAsync<RowDataPacket[]>(
      query,
      queryParams,
    );

    res.json({
      total: allResults.length,
      page: pageNum,
      per_page: pageSize,
      data: paginatedResults,
    });
  }

  // Get reservation by ID
  async getReservationById(req: Request, res: Response, next: NextFunction) {
    res.json(req.reservation);
  }
}

const reservationController = new ReservationController();
export default reservationController;
