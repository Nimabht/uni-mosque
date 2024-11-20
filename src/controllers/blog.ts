import { Request, Response, NextFunction } from "express";
import AppError from "../utils/Classes/AppError";
import { join } from "path";
import { promises as fsPromises } from "fs";
import MySQLDriver from "../db/mysql/connection";
import { RowDataPacket } from "mysql2";
import { validateBlogForCreate } from "../validators/blog";
import resizeThumbnail from "../utils/imageResizer/resizeThumbnail";

class BlogController {
  async getAllBlogs(req: Request, res: Response, next: NextFunction) {
    let { page = 1, per_page = 10 } = req.query;

    if (isNaN(Number(page)) || isNaN(Number(per_page))) {
      page = 1;
      per_page = 10;
    }

    const offset = (Number(page) - 1) * Number(per_page);

    const query = `
      SELECT 
        blogs.id, 
        blogs.title, 
        blogs.content, 
        blogs.comments_enabled, 
        blogs.created_at, 
        blogs.updated_at, 
        users.first_name as author_first_name,
        users.last_name as author_last_name
      FROM blogs
      JOIN users ON blogs.author_id = users.id
      LIMIT ? OFFSET ?`;

    const blogs = await MySQLDriver.queryAsync<RowDataPacket[]>(query, [
      Number(per_page),
      offset,
    ]);

    const totalQuery = `SELECT COUNT(*) as total FROM blogs`;
    const totalResult = await MySQLDriver.queryAsync<RowDataPacket[]>(
      totalQuery,
    );
    const total = totalResult[0].total;

    res.json({ total, page: Number(page), data: blogs });
  }

  async getBlogById(req: Request, res: Response, next: NextFunction) {
    const { blogId } = req.params;

    const query = `
      SELECT 
        blogs.id, 
        blogs.title, 
        blogs.thumbnailFileName, 
        blogs.content, 
        blogs.comments_enabled, 
        blogs.created_at, 
        blogs.updated_at, 
        users.first_name as author_first_name, 
        users.last_name as author_last_name
      FROM blogs
      JOIN users ON blogs.author_id = users.id
      WHERE blogs.id = ?`;

    const result = await MySQLDriver.queryAsync<RowDataPacket[]>(query, [
      blogId,
    ]);

    if (result.length === 0) {
      return next(AppError.notFound("Blog not found."));
    }

    res.json(result[0]);
  }

  async getBlogThumbnailById(req: Request, res: Response, next: NextFunction) {
    const { blogId } = req.params;

    // Query to get the thumbnail file name for the blog
    const query = `SELECT thumbnailFileName FROM blogs WHERE id = ?`;
    const result = await MySQLDriver.queryAsync<RowDataPacket[]>(query, [
      blogId,
    ]);

    if (result.length === 0 || !result[0].thumbnailFileName) {
      return next(AppError.notFound("Thumbnail not found."));
    }

    const avatarPath = join(
      __dirname,
      "../../public",
      "thumbnail",
      result[0].thumbnailFileName,
    );

    // Check if the thumbnail file exists
    try {
      await fsPromises.access(avatarPath);
      res.sendFile(avatarPath);
    } catch (err) {
      return next(AppError.notFound("Thumbnail file not found on server."));
    }
  }

  async getNewestBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const query = `
        SELECT 
          blogs.id, 
          blogs.title, 
          blogs.thumbnailFileName, 
          blogs.content, 
          blogs.created_at, 
          users.first_name as author_first_name,
          users.last_name as author_last_name
        FROM blogs
        JOIN users ON blogs.author_id = users.id
        ORDER BY blogs.created_at DESC
        LIMIT 3
      `;

      const blogs = await MySQLDriver.queryAsync<RowDataPacket[]>(query);

      res.json({ data: blogs });
    } catch (error) {
      next(AppError.internal("Could not fetch the newest blogs."));
    }
  }

  async createBlog(req: Request, res: Response, next: NextFunction) {
    const { error, value } = validateBlogForCreate(req.body);
    if (error) {
      return next(
        AppError.badRequest(error.details.map((e) => e.message).join(", ")),
      );
    }
    const { title, content, comments_enabled } = req.body;
    const author_id = req.tokenPayload.userId;
    const thumbnailFileName = (await resizeThumbnail(req.file)) || null;

    const query = `INSERT INTO blogs (title, thumbnailFileName, content, author_id, comments_enabled) VALUES (?, ?, ?, ?, ?)`;
    await MySQLDriver.queryAsync(query, [
      title,
      thumbnailFileName,
      content,
      author_id,
      comments_enabled,
    ]);

    res.status(201).json({ message: "Blog created successfully" });
  }

  async updateBlog(req: Request, res: Response, next: NextFunction) {
    const { error, value } = validateBlogForCreate(req.body);
    if (error) {
      return next(
        AppError.badRequest(error.details.map((e) => e.message).join(", ")),
      );
    }

    const { blogId } = req.params;
    const { title, content } = req.body;

    const queryBlog = `SELECT * FROM blogs WHERE id = ?`;
    const blogs: any[] = await MySQLDriver.queryAsync<RowDataPacket[]>(
      queryBlog,
      [blogId],
    );

    if (blogs.length === 0) {
      return next(AppError.notFound("Blog not found."));
    }

    const query = `
      UPDATE blogs 
      SET title = ?, content = ?
      WHERE id = ?
    `;

    const result: any = await MySQLDriver.queryAsync(query, [
      title,
      content,
      blogId,
    ]);

    if (result.affectedRows === 0) {
      return next(AppError.notFound("Blog not found."));
    }

    res.status(200).json({ message: "Blog updated successfully" });
  }

  async deleteBlog(req: Request, res: Response, next: NextFunction) {
    const { blogId } = req.params;

    const queryBlog = `SELECT thumbnailFileName FROM blogs WHERE id = ?`;
    const blogs: any[] = await MySQLDriver.queryAsync<RowDataPacket[]>(
      queryBlog,
      [blogId],
    );

    if (blogs.length === 0) {
      return next(AppError.notFound("Blog not found."));
    }

    const thumbnailPath = join(
      "uploads",
      "thumbnails",
      blogs[0].thumbnailFileName,
    );
    await fsPromises.unlink(thumbnailPath).catch(() => null);

    const query = `DELETE FROM blogs WHERE id = ?`;
    const result: any = await MySQLDriver.queryAsync(query, [blogId]);

    if (result.affectedRows === 0) {
      return next(AppError.internal("Could not delete the blog."));
    }

    res.status(204).end();
  }

  async uploadThumbnail(req: Request, res: Response, next: NextFunction) {
    const { blogId } = req.params;
    const newThumbnail = req.file?.filename;

    if (!newThumbnail) {
      return next(AppError.badRequest("No file uploaded."));
    }

    const thumbnailFileName = (await resizeThumbnail(req.file)) || null;

    const query = `UPDATE blogs SET thumbnailFileName = ? WHERE id = ?`;
    const result: any = await MySQLDriver.queryAsync(query, [
      thumbnailFileName,
      blogId,
    ]);

    if (result.affectedRows === 0) {
      return next(AppError.notFound("Blog not found."));
    }

    res.status(200).json({ message: "Thumbnail uploaded successfully" });
  }

  async removeThumbnail(req: Request, res: Response, next: NextFunction) {
    const { blogId } = req.params;

    const query = `SELECT thumbnailFileName FROM blogs WHERE id = ?`;
    const result = await MySQLDriver.queryAsync<RowDataPacket[]>(query, [
      blogId,
    ]);

    if (result.length === 0 || !result[0].thumbnailFileName) {
      return next(AppError.notFound("Thumbnail not found."));
    }

    const thumbnailPath = join(
      "../../public",
      "thumbnails",
      result[0].thumbnailFileName,
    );
    await fsPromises.unlink(thumbnailPath).catch(() => null);

    const updateQuery = `UPDATE blogs SET thumbnailFileName = NULL WHERE id = ?`;
    await MySQLDriver.queryAsync(updateQuery, [blogId]);

    res.status(200).json({ message: "Thumbnail removed successfully" });
  }
}

const blogController = new BlogController();
export default blogController;
