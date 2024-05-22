import sharp from "sharp";
import { join, extname } from "node:path";
import { Request } from "express";

export default async (file: Request["file"]) => {
  if (!file) return null;

  const fileExtension = extname(file.originalname);
  const originalFileNameWithoutExtension = file.originalname.replace(
    fileExtension,
    "",
  );

  const mosqueLogoFileName = `${Date.now()}-${originalFileNameWithoutExtension}.jpeg`;

  await sharp(file.buffer)
    .resize(504, 504)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(join(__dirname, `../../../public/logo/${mosqueLogoFileName}`));

  return mosqueLogoFileName;
};
