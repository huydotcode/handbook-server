import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import apiRouter from './routes/routes';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import {
    globalErrorHandler,
    handleUncaughtException,
    handleUnhandledRejection,
    notFoundHandler,
} from './common/errors';
import { config } from './common/utils/config';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);
// Morgan logging format based on environment
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

app.use(
    cors({
        origin: [config.clientUrl],
        credentials: true,
    })
);

app.use('/api/v1', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

app.use(notFoundHandler);
app.use(globalErrorHandler);
handleUnhandledRejection();
handleUncaughtException();

export default app;
