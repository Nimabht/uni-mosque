import { Request, Response, NextFunction } from "express";
import AppError from "../utils/Classes/AppError";
import MySQLDriver from "../db/mysql/connection";
import { RowDataPacket } from "mysql2";
import {
  validateCommentForCreate,
  validateCommentShowStatus,
} from "../validators/comment";

class CommentController {
  async getAllComments(req: Request, res: Response, next: NextFunction) {
    try {
      const query = `
        SELECT *
        FROM comments`;
      const result = await MySQLDriver.queryAsync<RowDataPacket[]>(query, []);
      res.json(result);
    } catch (error: any) {
      const ex = AppError.internal(error.message);
      return next(ex);
    }
  }

  async getCommentById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(req.comment);
    } catch (error: any) {
      const ex = AppError.internal(error.message);
      return next(ex);
    }
  }

  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        body,
        name,
        email,
        parentId,
        ownerId,
        commentableType,
        commentableId,
      } = req.body;

      // Validate the incoming comment data
      const { error, value } = validateCommentForCreate(req.body);
      if (error) {
        const ex = AppError.badRequest(error.details[0].message);
        return next(ex);
      }

      //Check if the journal or blog comments_enabled is true if not forbid user
      const queryIsEnabled = `SELECT comments_enabled FROM ${commentableType}s WHERE id = ?`;
      const isEnabled: any[] = await MySQLDriver.queryAsync(queryIsEnabled, [
        commentableId,
      ]);
      if (isEnabled[0].comments_enabled === 0) {
        const ex = AppError.Forbidden("Comments are disabled for this post");
        return next(ex);
      }

      // Construct the SQL query to insert the new comment
      const query = `
        INSERT INTO comments (body, name, email, parent_id, commentable_type, commentable_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      // Execute the query
      const result: any = await MySQLDriver.queryAsync(query, [
        value.body,
        value.name,
        value.email,
        parentId || null, // If parentId is not provided, set it to null
        commentableType,
        commentableId,
      ]);

      // Check if the comment was successfully inserted
      if (result.affectedRows === 1) {
        res.status(201).json({ message: "Comment created successfully" });
      } else {
        const ex = AppError.internal("Failed to create comment");
        return next(ex);
      }
    } catch (error: any) {
      const ex = AppError.internal(error.message);
      return next(ex);
    }
  }

  async updateCommentShowStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const commentId = req.params.commentId;
      const { show } = req.body;

      // Validate the incoming show status
      const { error, value } = validateCommentShowStatus({ show });
      if (error) {
        const ex = AppError.badRequest(error.details[0].message);
        return next(ex);
      }

      // Construct the SQL query to update the show attribute of the comment
      const query = `
        UPDATE comments 
        SET show = ?
        WHERE id = ?
      `;

      // Execute the query
      const result: any = await MySQLDriver.queryAsync(query, [
        value.show,
        +commentId,
      ]);

      // Check if the comment show status was successfully updated
      if (result.changedRows === 1) {
        res
          .status(200)
          .json({ message: "Comment show status updated successfully" });
      } else {
        const ex = AppError.notFound("Comment not found");
        return next(ex);
      }
    } catch (error: any) {
      const ex = AppError.internal(error.message);
      return next(ex);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const commentId = req.params.commentId;

      // Begin the transaction
      await MySQLDriver.queryAsync("START TRANSACTION");

      // Create a temporary table to store the comment hierarchy
      await MySQLDriver.queryAsync(`
      CREATE TEMPORARY TABLE CommentHierarchy (id INT PRIMARY KEY)
    `);

      // Populate the temporary table with the hierarchy of comments
      await MySQLDriver.queryAsync(
        `
      INSERT INTO CommentHierarchy (id)
      WITH RECURSIVE CommentHierarchyCTE AS (
        SELECT id FROM comments WHERE id = ?
        UNION ALL
        SELECT c.id FROM comments c
        JOIN CommentHierarchyCTE ch ON c.parent_id = ch.id
      )
      SELECT id FROM CommentHierarchyCTE
    `,
        [commentId],
      );

      // Delete the comments using the temporary table
      const result: any = await MySQLDriver.queryAsync(`
      DELETE FROM comments WHERE id IN (SELECT id FROM CommentHierarchy)
    `);

      // Commit the transaction
      await MySQLDriver.queryAsync("COMMIT");

      // Check if any comments were deleted
      if (result.affectedRows > 0) {
        res.status(204).end();
      } else {
        const ex = AppError.notFound("Comment not found");
        return next(ex);
      }
    } catch (error: any) {
      // Rollback the transaction in case of error
      await MySQLDriver.queryAsync("ROLLBACK");
      const ex = AppError.internal(error.message);
      return next(ex);
    }
  }

  // async deleteComment(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const commentId = req.params.commentId;

  //     // Construct the SQL query to delete the comment and its children recursively
  //     const query = `
  //       WITH RECURSIVE CommentHierarchy AS (
  //         SELECT id FROM comments WHERE id = ?
  //         UNION ALL
  //         SELECT c.id FROM comments c
  //         JOIN CommentHierarchy ch ON c.parent_id = ch.id
  //       )
  //       DELETE FROM comments WHERE id IN (SELECT id FROM CommentHierarchy)
  //     `;

  //     // Execute the query
  //     const result: any = await MySQLDriver.queryAsync(query, [commentId]);

  //     // Check if any comments were deleted
  //     if (result.affectedRows > 0) {
  //       res.status(204).end();
  //     } else {
  //       const ex = AppError.notFound("Comment not found");
  //       return next(ex);
  //     }
  //   } catch (error: any) {
  //     const ex = AppError.internal(error.message);
  //     return next(ex);
  //   }
  // }

  async getAllCommentsByTypeAndId(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const commentableType = req.params.commentable_type as string;
      const commentableId = parseInt(req.params.commentable_id as string);

      if (commentableType !== "blog" && commentableType !== "journal") {
        const ex = AppError.badRequest(
          'Commentable type must be either "blog" or "journal"',
        );
        return next(ex);
      }

      // Construct the SQL query to select comments recursively
      const query = `
        WITH RECURSIVE CommentHierarchy AS (
          SELECT * FROM comments WHERE commentable_type = ? AND commentable_id = ? AND parent_id IS NULL
          UNION ALL
          SELECT c.* FROM comments c
          JOIN CommentHierarchy ch ON c.parent_id = ch.id
        )
        SELECT * FROM CommentHierarchy WHERE show = 1;
      `;

      // Execute the query
      const comments: any = await MySQLDriver.queryAsync(query, [
        commentableType,
        commentableId,
      ]);

      // Check if comments were found
      if (comments.length > 0) {
        res.status(200).json({ comments });
      } else {
        const ex = AppError.notFound(
          "No comments found for the provided criteria",
        );
        return next(ex);
      }
    } catch (error: any) {
      const ex = AppError.internal(error.message);
      return next(ex);
    }
  }
}

const commentController = new CommentController();
export default commentController;
