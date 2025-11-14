import { config as dotenvConfig } from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenvConfig();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

export const cloudinaryClient = cloudinary;
