import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: async (req, file) => {
        const fileName = file.originalname
            .toLowerCase()
            .replace(/\s+/g, "-") // spaces → dash
            .replace(/\./g, "-")  // dots → dash
            .replace(/[^a-z0-9\-]/g, ""); // only keep a-z,0-9,-

        const uniqueFileName =
            Math.random().toString(36).substring(2) +
            "-" +
            Date.now() +
            "-" +
            fileName;

        const extension = file.originalname.split(".").pop()?.toLowerCase();

        return {
            public_id: uniqueFileName, // no extension
            format: extension,         // let Cloudinary save with correct format
        };
    },
});

export const multerUpload = multer({ storage });
