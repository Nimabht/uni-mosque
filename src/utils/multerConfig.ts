import multer, { StorageEngine } from "multer";
import { RequestHandler } from "express";
import AppError from "./Classes/AppError";

// Custom storage engine
const storage: StorageEngine = multer.memoryStorage();

// Multer file filter function
const multerFilter = (req: any, file: any, cb: any) => {
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg"
  ) {
    cb(null, true);
  } else {
    const ex = AppError.badRequest("Only .png, .jpg and .jpeg format allowed!");
    return cb(ex, false);
  }
};

// Multer upload configurations
const uploadAvatar: RequestHandler = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
}).single("avatar");

// Multer upload configurations
const uploadLogo: RequestHandler = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
}).single("logo");

// const uploadThumbnail: RequestHandler = multer({
//   storage: storage,
//   fileFilter: multerFilter,
//   limits: {
//     files: 1,
//     fileSize: 3 * 1024 * 1024, // 3 MB
//   },
// }).single("thumbnail");

// const uploadImage: RequestHandler = multer({
//   storage: storage,
//   fileFilter: multerFilter,
//   limits: {
//     files: 1,
//     fileSize: 5 * 1024 * 1024, // 5 MB
//   },
// }).single("image");

export { uploadAvatar, uploadLogo };
