import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/Classes/AppError";
import MySQLDriver from "../../db/mysql/connection";
import { RowDataPacket } from "mysql2";

export default async (req: Request, res: Response, next: NextFunction) => {};
