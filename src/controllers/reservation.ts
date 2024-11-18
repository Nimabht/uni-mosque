import { Request, Response, NextFunction } from "express";
import MySQLDriver from "../db/mysql/connection";
import { RowDataPacket } from "mysql2";
import AppError from "../utils/Classes/AppError";
import { validateReservationQuery } from "../validators/reservation";

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

    res.json(result[0]);
  }

  // Get all reservations for a specific user
  async getAllReservationsForUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { value, error } = validateReservationQuery(req.query);

    if (!!error) {
      const ex = AppError.badRequest(error.toString());
      return next(ex);
    }

    const userId = req.tokenPayload.userId;

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
      WHERE r.user_id = ?
    `;

    const queryParams: any[] = [userId];

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
      query += ` AND ${conditions.join(" AND ")}`;
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

  // Make a reservation
  async makeReservation(req: Request, res: Response, next: NextFunction) {
    const userId = req.tokenPayload.userId;
    const availableTimeId = req.params.availableTimeId;

    //Check if available time is exists and not already reserved
    const availableTimeQuery = `
      SELECT * FROM available_times WHERE id = ? AND reserved = 0
    `;
    const availableTimeResult = await MySQLDriver.queryAsync<RowDataPacket[]>(
      availableTimeQuery,
      [availableTimeId],
    );

    if (availableTimeResult.length === 0) {
      const ex = AppError.notFound(
        "Available time not found or already reserved",
      );
      return next(ex);
    }

    //Generate random tracking code
    const trackingCode = Math.random().toString(36).substr(2, 9);

    const { description } = req.body;

    const query = `
      INSERT INTO reservations (user_id, availableTime_id, description,tracking_code,status)
      VALUES (?, ?, ?, ?,?)
    `;

    const result: any = await MySQLDriver.queryAsync<RowDataPacket[]>(query, [
      userId,
      availableTimeId,
      description,
      trackingCode,
      "Pending",
    ]);

    const updateAvailableTimeStatus = `
      UPDATE available_times SET reserved = 1 WHERE id = ?
      `;

    await MySQLDriver.queryAsync<RowDataPacket[]>(updateAvailableTimeStatus, [
      availableTimeId,
    ]);

    res.json({
      message: "Reservation created successfully",
      reservationId: result.insertId,
    });
  }

  //Undo a reservation
  async undoReservation(req: Request, res: Response, next: NextFunction) {
    const reservationId = req.params.reservationId;
    const userId = req.tokenPayload.userId;

    //Check if reservation is exists and reserved by the user

    const reservationQuery = `
      SELECT * FROM reservations WHERE id = ? AND user_id = ? AND status = 'Pending'
    `;

    const isValidReservation: any = await MySQLDriver.queryAsync<
      RowDataPacket[]
    >(reservationQuery, [reservationId, userId]);

    if (isValidReservation.length === 0) {
      const ex = AppError.notFound("Reservation not found");
      return next(ex);
    }

    const query = `
      DELETE FROM reservations WHERE id = ?
    `;

    const result: any = await MySQLDriver.queryAsync<RowDataPacket[]>(query, [
      reservationId,
    ]);

    if (result.affectedRows === 0) {
      const ex = AppError.notFound("Reservation not found");
      return next(ex);
    }

    const updateAvailableTimeStatus = `
      UPDATE available_times SET reserved = 0 WHERE id = ?
      `;

    await MySQLDriver.queryAsync<RowDataPacket[]>(updateAvailableTimeStatus, [
      isValidReservation[0].availableTime_id,
    ]);

    res.json({ message: "Reservation deleted successfully" });
  }
}

const reservationController = new ReservationController();
export default reservationController;
