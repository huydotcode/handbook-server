import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { ValidationConfig } from '../types/route.type';
import { ResponseUtil } from '../utils';

export const validateRequest =
    (schemas: ValidationConfig) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const validationSchema = z.object({
                body: schemas.body || z.any(),
                query: schemas.query || z.any(),
                params: schemas.params || z.any(),
            });

            const result = (await validationSchema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            })) as any;

            req.body = result.body;
            req.query = result.query;
            req.params = result.params;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Get the first error message
                const message =
                    (error as any).errors?.[0]?.message ||
                    'Dữ liệu không hợp lệ';
                ResponseUtil.error(res, message, 400);
            } else {
                next(error);
            }
        }
    };

export default validateRequest;
