import { NextFunction, Request, Response } from "express";
import {
  validateUserForLogin,
  validateUserForSignup,
} from "../validators/auth";
import AppError from "../utils/Classes/AppError";
import MySQLDriver from "../db/mysql/connection";
import { RowDataPacket } from "mysql2";
import validatePassword from "../utils/Helpers/user/validatePassword";
import userGenerateToken from "../utils/Helpers/user/userGenerateToken";
import bcrypt from "bcrypt";

class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    const { error, value } = validateUserForLogin(req.body);

    if (!!error) {
      const ex = AppError.badRequest(error.toString());
      return next(ex);
    }

    const users = await MySQLDriver.queryAsync<RowDataPacket[]>(
      `SELECT * FROM users WHERE username= ?`,
      [value.username],
    );
    const user = users[0];

    if (!user) {
      const ex = AppError.unAuthorized("Invalid username or password");
      return next(ex);
    }

    if (!(await validatePassword(value.password, user.password))) {
      const ex = AppError.unAuthorized("Invalid username or password");
      return next(ex);
    }
    const token = userGenerateToken(user, "20d");

    res.json({
      access_token: token,
      userInfo: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        role: user.role,
      },
    });
  }

  async signup(req: Request, res: Response, next: NextFunction) {
    // Validate the user input for signup
    const { error, value } = validateUserForSignup(req.body);

    if (!!error) {
      const ex = AppError.badRequest(error.toString());
      return next(ex);
    }

    // Check if the username or phone number is already taken
    const existingUser = await MySQLDriver.queryAsync<RowDataPacket[]>(
      `SELECT * FROM users WHERE username = ? OR phone_number = ?`,
      [value.username, value.phone_number],
    );

    if (existingUser.length > 0) {
      const ex = AppError.badRequest("User already exists");
      return next(ex);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(value.password, salt);

    const newUser = {
      username: value.username,
      password: hashedPassword,
      first_name: value.first_name,
      last_name: value.last_name,
      phone_number: value.phone_number,
      role: value.role || "User",
    };

    await MySQLDriver.queryAsync(
      `INSERT INTO users (username, password,first_name,last_name,phone_number,role) VALUES (?, ?, ? , ? , ? , ?)`,
      [
        newUser.username,
        newUser.password,
        newUser.first_name,
        newUser.last_name,
        newUser.phone_number,
        newUser.role,
      ],
    );

    res.status(201).json({
      username: newUser.username,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      phone_number: newUser.phone_number,
      role: newUser.role,
    });
  }
}

const authController = new AuthController();
export default authController;
