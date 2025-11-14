import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError, UnauthorizedError } from '../common/errors/app.error';
import { MessageService } from '../services/message.service';

/**
 * Controller handling HTTP endpoints for messages.
 */
export class MessageController {
    private messageService: MessageService;

    constructor() {
        this.messageService = new MessageService();
    }

    /**
     * GET /api/messages/conversation/:conversation_id
     * Fetch paginated messages of a conversation.
     */
    public getMessages = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new UnauthorizedError('Unauthorized');
            }

            const conversationId = req.params.conversation_id;
            if (!conversationId) {
                throw new AppError(
                    'Conversation ID is required',
                    HTTP_STATUS.BAD_REQUEST
                );
            }

            const page = parseInt((req.query.page as string) || '1', 10) || 1;
            const pageSize =
                parseInt(
                    (req.query.page_size as string) ||
                        (req.query.pageSize as string) ||
                        '20',
                    10
                ) || 20;

            const result = await this.messageService.getConversationMessages(
                conversationId,
                userId,
                page,
                pageSize
            );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Messages retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/messages/conversation/:conversation_id/pinned
     * Fetch pinned messages of a conversation.
     */
    public getPinnedMessages = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new UnauthorizedError('Unauthorized');
            }

            const conversationId = req.params.conversation_id;
            if (!conversationId) {
                throw new AppError(
                    'Conversation ID is required',
                    HTTP_STATUS.BAD_REQUEST
                );
            }

            const page = parseInt((req.query.page as string) || '1', 10) || 1;
            const pageSize =
                parseInt(
                    (req.query.page_size as string) ||
                        (req.query.pageSize as string) ||
                        '20',
                    10
                ) || 20;

            const result =
                await this.messageService.getPinnedConversationMessages(
                    conversationId,
                    userId,
                    page,
                    pageSize
                );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Pinned messages retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/messages/conversation/:conversation_id/search
     * Search conversation messages by keyword.
     */
    public search = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new UnauthorizedError('Unauthorized');
            }

            const conversationId = req.params.conversation_id;
            if (!conversationId) {
                throw new AppError(
                    'Conversation ID is required',
                    HTTP_STATUS.BAD_REQUEST
                );
            }

            const keyword = (req.query.q as string) || '';

            const messages =
                await this.messageService.searchConversationMessages(
                    conversationId,
                    keyword,
                    userId
                );

            ResponseUtil.success(res, messages, 'Messages found successfully');
        } catch (error) {
            next(error);
        }
    };
}
