import mongoose from 'mongoose';
import { env } from '../config';

let isConnected = false;

/**
 * Connects to MongoDB database
 * @throws Error if connection fails
 */
export const connectToMongo = async (): Promise<void> => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    if (!env.MONGODB_URI) {
        throw new Error('MongoDB URI is not defined in environment variables');
    }

    try {
        // Configure mongoose
        mongoose.set('strictQuery', true);

        await mongoose.connect(env.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        isConnected = true;
        console.log('Successfully connected to MongoDB.');

        // Handle connection events
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            isConnected = false;
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            isConnected = false;
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
            isConnected = true;
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        isConnected = false;
        throw error;
    }
};

/**
 * Disconnects from MongoDB database
 */
export const disconnectFromMongo = async (): Promise<void> => {
    if (!isConnected) {
        return;
    }

    try {
        await mongoose.disconnect();
        isConnected = false;
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
        throw error;
    }
};

/**
 * Gets the current MongoDB connection status
 */
export const isMongoConnected = (): boolean => {
    return isConnected && mongoose.connection.readyState === 1;
};
