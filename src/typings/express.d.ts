import { JwtPayload } from "jsonwebtoken";
import { IClient } from "../interfaces/clientInt";

declare global {
  namespace Express {
    interface Request {
      tokenPayload: JwtPayload;
      client;
      user;
      permission;
      basic_username?: string;
      basic_password?: string;
    }
  }
}
