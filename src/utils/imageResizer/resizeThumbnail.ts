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

  const thumbnailFileName = `${Date.now()}-${originalFileNameWithoutExtension}.jpeg`;
  await sharp(file.buffer)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(join(__dirname, `../../../public/thumbnail/${thumbnailFileName}`));

  return thumbnailFileName;
};
