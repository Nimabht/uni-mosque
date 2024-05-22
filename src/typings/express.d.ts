import { JwtPayload } from "jsonwebtoken";
import { IClient } from "../interfaces/clientInt";
import { IAvailableTime } from "./../interface/Request";

declare global {
  namespace Express {
    interface Request {
      tokenPayload: JwtPayload;
      availableTime?: IAvailableTime;
      client;
      user;
      permission;
      basic_username?: string;
      basic_password?: string;
      availableTimseUserCheck?: string;
      reservation?: any;
    }
  }
}
