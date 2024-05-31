import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/Classes/AppError";
import MySQLDriver from "../../db/mysql/connection";
import { RowDataPacket } from "mysql2";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const commentId = req.params.commentId;

    // Define a recursive SQL query using a common table expression (CTE)
    const query = `
      WITH RECURSIVE CommentTree AS (
        SELECT * FROM comments WHERE id = ?
        UNION ALL
        SELECT c.* FROM comments c
        JOIN CommentTree ct ON c.parent_id = ct.id
      )
      SELECT * FROM CommentTree;
    `;

    const comments = await MySQLDriver.queryAsync<RowDataPacket[]>(query, [
      commentId,
    ]);

    const comment = comments[0];
    if (!comment) {
      const ex = AppError.notFound("Comment not found");
      return next(ex);
    }

    // @ts-ignore
    req.comment = comment;
    next();
  } catch (error: any) {
    const ex = AppError.internal(error.message);
    return next(ex);
  }
};
