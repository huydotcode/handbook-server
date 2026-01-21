import { v2 as cloudinary } from 'cloudinary';
import { config as dotenvConfig } from 'dotenv';
import { env } from './env.config';

dotenvConfig();

export const CLOUDINARY_DEFAULT_FOLDER =
    env.NODE_ENV === 'development' ? 'handbook-dev' : 'handbook';

cloudinary.config({
    cloud_name: env.CLOUDINARY_NAME,
    api_key: env.CLOUDINARY_KEY,
    api_secret: env.CLOUDINARY_SECRET,
});

export const cloudinaryClient = cloudinary;
