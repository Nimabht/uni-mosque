import { Request, Response, NextFunction } from "express";
import AppError from "../../utils/Classes/AppError";
import MySQLDriver from "../../db/mysql/connection";
import { RowDataPacket } from "mysql2";

const hasAccessByAdminOrBlogOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId, role } = req.tokenPayload;
  const blogId = req.params.blogId;

  // If the user is an Admin, grant access immediately
  if (role === "Admin") {
    return next();
  }

  // If the user has the "Blogger" role, check ownership
  if (role === "Blogger") {
    const query = `SELECT author_id FROM blogs WHERE id = ?`;
    const result = await MySQLDriver.queryAsync<RowDataPacket[]>(query, [
      blogId,
    ]);

    if (result.length === 0) {
      return next(AppError.notFound("Blog not found."));
    }

    const blogOwnerId = result[0].author_id;

    // Allow access if the user is the owner of the blog
    if (blogOwnerId === userId) {
      return next();
    }
  }

  // If none of the conditions are met, deny access
  return next(AppError.Forbidden("Forbidden"));
};

export default hasAccessByAdminOrBlogOwner;
