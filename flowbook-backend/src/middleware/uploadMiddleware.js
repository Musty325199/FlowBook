import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed"), false);
  }
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadImage = (field) => [
  multerUpload.single(field),
  async (req, res, next) => {
    if (!req.file) return next();

    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "flowbook" },
        (error, result) => {
          if (error) return next(error);
          req.file.path = result.secure_url;
          next();
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (err) {
      next(err);
    }
  }
];