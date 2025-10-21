import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import apiRouter from './routes/api.route';
import { connectToMongo } from './services/mongodb';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import authMiddleware from './middlewares/auth.middleware';
import authRouter from './routes/auth.route';
import { config } from './utils/config';

dotenv.config();

const morgan = require('morgan');

const app = express();
app.set('trust proxy', true);

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
        origin: [
            'http://localhost:3000',
            'https://handbookk.vercel.app',
            config.clientUrl,
        ],
        credentials: true,
    })
);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', authMiddleware, apiRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

export default app;
