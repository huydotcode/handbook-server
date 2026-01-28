import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import { AIService } from '../services/ai.service';
import { BaseController } from './base.controller';

export class AIController extends BaseController {
    private aiService: AIService;

    constructor() {
        super();
        this.aiService = new AIService();
    }

    public chat = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { message } = req.body as { message?: string };
            const result = await this.aiService.sendMessage(message || '');

            ResponseUtil.success(
                res,
                result,
                'Handbook AI response generated successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
