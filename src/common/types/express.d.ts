import 'express';
import { JwtDecoded } from './jwt';

declare global {
    namespace Express {
        interface Request {
            user?: JwtDecoded;
        }
    }
}
