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
import { connectToMongo } from './common/utils/mongodb';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

connectToMongo();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);
app.use(morgan('dev'));

app.use(
    cors({
        origin: [config.clientUrl],
        credentials: true,
    })
);

app.use('/api/v1', apiRouter);

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
