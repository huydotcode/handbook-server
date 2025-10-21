import mongoose from 'mongoose';
import { config } from '../utils/config';

export const connectToMongo = async () => {
    if (!config.mongodbUri) {
        console.error('MongoDB URI is not defined in environment variables');
        process.exit(1);
    }

    try {
        await mongoose.connect(config.mongodbUri);
        console.log('Successfully connected to MongoDB.');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
