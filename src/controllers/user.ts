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
// import resizeUserAvatar from "../utils/resizeImage/resizeUserAvatar";
// import { Article } from "../models/article";
// import articleRemover from "../utils/articleRemover";
// import { Comment } from "../models/comment";
// import userSearch from "../utils/userSearch";
// import paginate from "../utils/pagination";

class UserController {
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    let { page, pageSize, search } = req.query;
    let query;
    let result: any[] = [];
    if (!!search) {
      query = `
      SELECT id,username,first_name,last_name,phone_number,role,created_at,updated_at 
      FROM users 
      WHERE 
        firstname LIKE ? OR 
        lastname LIKE ? OR 
        username LIKE ?
    `;
      result = await MySQLDriver.queryAsync<RowDataPacket[]>(query, [
        search,
        search,
        search,
      ]);
    } else {
      query = `
      SELECT id,username,first_name,last_name,phone_number,role,avatar_path,created_at,updated_at 
      FROM users `;
      result = await MySQLDriver.queryAsync<RowDataPacket[]>(query, []);
    }
    if (!page || !pageSize) {
      page = "1";
      pageSize = "10";
    }

    const startIndex =
      (parseInt(page as string) - 1) * parseInt(pageSize as string);
    const endIndex = startIndex + parseInt(pageSize as string);
    const users = result.slice(startIndex, endIndex);

    res.json({
      total: result.length,
      page: Math.max(1, parseInt(page as string) || 1),
      data: users,
    });
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.userId;

    const query = `
      SELECT id,username,first_name,last_name,phone_number,role,avatar_path,created_at,updated_at 
      FROM users WHERE id = ?`;
    const result = await MySQLDriver.queryAsync<RowDataPacket[]>(query, [
      userId,
    ]);
    res.json(result[0]);
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.userId;

    const { error, value } = validateUserForUpdate(req.body);
    if (!!error) {
      const ex = AppError.badRequest(error.details[0].message);
      return next(ex);
    }
    // Check if username already exists in database
    const users = await MySQLDriver.queryAsync<RowDataPacket[]>(
      `SELECT * FROM users WHERE username= ? OR phone_number = ?`,
      [value.username, value.phone_number],
    );

    if (users.length !== 0) {
      const ex = AppError.badRequest("Duplicated information.");
      return next(ex);
    }
    const { first_name, last_name, username, phone_number } = value;

    const updateFields: any = {};

    if (first_name) {
      updateFields.first_name = first_name;
    }

    if (last_name) {
      updateFields.last_name = last_name;
    }

    if (username) {
      updateFields.username = username;
    }

    if (phone_number) {
      updateFields.phone_number = phone_number;
    }

    const query = `
      UPDATE users 
      SET ${Object.keys(updateFields)
        .map((field) => `${field} = ?`)
        .join(", ")}
      WHERE id = ?
    `;

    const updateValues = Object.values(updateFields);
    updateValues.push(userId);

    const result: any = await MySQLDriver.queryAsync(query, updateValues);

    if (result.changedRows !== "0") {
      res.status(200).end();
    } else {
      const ex = AppError.badRequest("");
      return next(ex);
    }
  }

  async updateUserAvatar(req: Request, res: Response, next: NextFunction) {
    if (!req.file) {
      const ex = AppError.badRequest("File is empty.");
      return next(ex);
    }

    const user = req.user;
    const userId = req.params.userId;

    // delete the previous avatar
    if (user.avatar_path !== "anonymous.png" && user.avatar_path !== "") {
      const path = join("public", "avatars", user.avatar_path);
      await fsPromises.unlink(path);
    }

    const filename = await resizeUserAvatar(req.file);

    const query = `
      UPDATE users 
      SET avatar_path = ?
      WHERE id = ?
    `;

    await MySQLDriver.queryAsync(query, [filename, userId]);
    res.status(200).end();
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.userId;

    //FIXME: Delete user's articles and comments and avatar
    // const userArticles = await Article.find({ author: user._id });
    // for (const article of userArticles) {
    //   await articleRemover(article._id);
    // }
    // await Comment.deleteMany({ user: user._id });
    // if (
    //   user.avatarFileName !== "male-anonymous.png" &&
    //   user.avatarFileName !== "female-anonymous.png"
    // ) {
    //   const path = join("public", "avatars", user.avatarFileName);
    //   await fsPromises.unlink(path);
    // }
    const query = `
    DELETE FROM users WHERE id = ?
    `;
    await MySQLDriver.queryAsync(query, [userId]);
    res.status(204).end();
  }

  async getUserAvatar(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.userId;

    const query = `
      SELECT avatar_path FROM users WHERE id = ?`;
    const result = await MySQLDriver.queryAsync<RowDataPacket[]>(query, [
      userId,
    ]);

    if (result.length === 0) {
      const ex = AppError.notFound("User avatar not found.");
      return next(ex);
    }

    if (
      result[0].avatar_path === "" ||
      result[0].avatar_path === "anonymous.png"
    ) {
      const path = join(__dirname, "../../public", "avatars", "anonymous.png");

      res.sendFile(path);
      return;
    }

    const avatarPath = join(
      __dirname,
      "../../public",
      "avatars",
      result[0].avatar_path,
    );

    res.sendFile(avatarPath);
  }
}

const userController = new UserController();
export default userController;
