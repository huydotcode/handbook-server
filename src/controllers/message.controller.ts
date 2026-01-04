import { NextFunction, Request, Response } from 'express';
import {
    getAuthenticatedUserId,
    getPaginationParams,
    validateRequiredBodyField,
    validateRequiredParam,
} from '../common/utils/controller.helper';
import { ResponseUtil } from '../common/utils/response';
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
     * GET /api/messages/conversation/:conversationId
     * Fetch paginated messages of a conversation.
     */
    public getMessages = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const conversationId = req.params.conversationId;
            validateRequiredParam(conversationId, 'Conversation ID');

            const { page, pageSize } = getPaginationParams(req, 20);

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
     * GET /api/messages/conversation/:conversationId/pinned
     * Fetch pinned messages of a conversation.
     */
    public getPinnedMessages = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const conversationId = req.params.conversationId;
            validateRequiredParam(conversationId, 'Conversation ID');

            const { page, pageSize } = getPaginationParams(req, 20);

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
     * GET /api/messages/conversation/:conversationId/search
     * Search conversation messages by keyword.
     */
    public search = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const conversationId = req.params.conversationId;
            validateRequiredParam(conversationId, 'Conversation ID');

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

    /**
     * POST /api/v1/messages
     * Send a new message.
     */
    public sendMessage = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const messageData = req.body;
            validateRequiredBodyField(req.body, 'conversation');

            const message = await this.messageService.createMessage(
                messageData,
                userId
            );

            ResponseUtil.created(res, message, 'Message sent successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/messages/:id
     * Delete a message (sender only).
     */
    public deleteMessage = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const messageId = req.params.id;
            validateRequiredParam(messageId, 'Message ID');
            const userId = getAuthenticatedUserId(req);

            await this.messageService.deleteMessage(messageId, userId);

            ResponseUtil.success(
                res,
                { success: true },
                'Message deleted successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
