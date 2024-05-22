import { Request, Response, NextFunction } from "express";
import MySQLDriver from "../db/mysql/connection";
import { RowDataPacket } from "mysql2";
import AppError from "../utils/Classes/AppError";
import { join } from "path";
import { promises as fsPromises } from "fs";
import { validateMosqueProfile } from "./../validators/validateMosqueProfile";
import resizeMosqueLogo from "../utils/imageResizer/resizeMosqueLogo";

class MosqueProfileController {
  // Get mosque profile
  async getProfile(req: Request, res: Response, next: NextFunction) {
    const query = `SELECT * FROM mosque_profile WHERE id = 1`; // Assuming there's only one mosque profile with id = 1
    const result = await MySQLDriver.queryAsync<RowDataPacket[]>(query);

    if (result.length === 0) {
      const ex = AppError.notFound("Mosque profile not found.");
      return next(ex);
    }

    res.json(result[0]);
  }

  // Edit mosque profile
  async editProfile(req: Request, res: Response, next: NextFunction) {
    const { error, value } = validateMosqueProfile(req.body);
    if (error) {
      const ex = AppError.badRequest(error.details[0].message);
      return next(ex);
    }

    const { description, phoneNumbers, email, address } = value;

    const query = `
      UPDATE mosque_profile
      SET 
        description = ?, 
        phoneNumbers = ?, 
        email = ?, 
        address = ?, 
      WHERE id = 1
    `;

    const updateValues = [description, phoneNumbers, email, address];

    const result: any = await MySQLDriver.queryAsync(query, updateValues);

    if (result.affectedRows === 0) {
      const ex = AppError.notFound("Failed to update mosque profile.");
      return next(ex);
    }

    res.status(200).end();
  }

  // Get mosque logo
  async getLogo(req: Request, res: Response, next: NextFunction) {
    const query = `SELECT logo FROM mosque_profile WHERE id = 1`;
    const result = await MySQLDriver.queryAsync<RowDataPacket[]>(query);

    if (result.length === 0) {
      const ex = AppError.notFound("Mosque logo not found.");
      return next(ex);
    }

    const logoPath = result[0].logo;
    const filePath = join(__dirname, "../../public", logoPath);

    try {
      await fsPromises.access(filePath);
      res.sendFile(filePath);
    } catch (err) {
      const ex = AppError.notFound("Logo file not found.");
      return next(ex);
    }
  }

  // Upload mosque logo
  async uploadLogo(req: Request, res: Response, next: NextFunction) {
    if (!req.file) {
      const ex = AppError.badRequest("File is empty.");
      return next(ex);
    }

    const query = `SELECT logo FROM mosque_profile WHERE id = 1`;
    const result = await MySQLDriver.queryAsync<RowDataPacket[]>(query);

    if (result.length === 0) {
      const ex = AppError.notFound("Mosque profile not found.");
      return next(ex);
    }

    // Delete the previous logo if it exists and is not the default one
    const oldLogoPath = result[0].logo;
    const oldPath = join(__dirname, "../../public", oldLogoPath);
    try {
      await fsPromises.unlink(oldPath);
    } catch (err: any) {
      console.error(`Failed to delete old logo: ${err.message}`);
    }

    const newLogoPath = await resizeMosqueLogo(req.file); // Handle the file upload and return the new path

    const updateQuery = `
      UPDATE mosque_profile 
      SET logo = ? 
      WHERE id = 1
    `;
    await MySQLDriver.queryAsync(updateQuery, [newLogoPath]);

    res.status(200).json({ logo: newLogoPath });
  }
}

const mosqueProfileController = new MosqueProfileController();
export default mosqueProfileController;
