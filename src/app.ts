import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import apiRouter from './routes/routes';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import {
    globalErrorHandler,
    handleUncaughtException,
    handleUnhandledRejection,
    notFoundHandler,
} from './common/errors';
import authMiddleware from './middlewares/auth.middleware';
import authRouter from './routes/auth.route';
import { config } from './common/utils/config';
import { connectToMongo } from './common/utils/mongodb';

dotenv.config();

const morgan = require('morgan');

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

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', authMiddleware, apiRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use(notFoundHandler);
app.use(globalErrorHandler);
handleUnhandledRejection();
handleUncaughtException();

export default app;
