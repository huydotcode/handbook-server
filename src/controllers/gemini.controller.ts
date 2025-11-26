import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import { GeminiService } from '../services/gemini.service';

export class GeminiController {
    private geminiService: GeminiService;

    constructor() {
        this.geminiService = new GeminiService();
    }

    public chat = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { message } = req.body as { message?: string };
            const result = await this.geminiService.sendMessage(message || '');

            ResponseUtil.success(
                res,
                result,
                'Gemini response generated successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
