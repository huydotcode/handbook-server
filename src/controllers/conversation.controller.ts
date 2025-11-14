import { NextFunction, Request, Response } from 'express';
import { ConversationService } from '../services';
import { ResponseUtil } from '../common/utils/response';

export class ConversationController {
    private conversationService: ConversationService;

    constructor() {
        this.conversationService = new ConversationService();
    }

    /**
     * POST /api/v1/conversations
     * Create a new conversation
     */
    public createConversation = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const conversationData = req.body;
            const userId = req.user?.id;

            const conversation =
                await this.conversationService.createConversation(
                    conversationData,
                    userId as string
                );

            ResponseUtil.created(
                res,
                conversation,
                'Conversation created successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/conversations?user_id=:userId
     * Get conversations by participant with pagination
     */
    public getConversations = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.query.user_id as string;
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.page_size as string) || 20;

            if (!userId) {
                return ResponseUtil.validationError(res, 'User ID is required');
            }

            const result =
                await this.conversationService.getConversationsByParticipant(
                    userId,
                    {
                        page,
                        pageSize,
                    }
                );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Conversations retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/conversations/:id
     * Get conversation by ID
     */
    public getConversationById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                return ResponseUtil.unauthorized(res, 'Unauthorized');
            }

            const conversation =
                await this.conversationService.getConversationById(id, userId);

            ResponseUtil.success(
                res,
                conversation,
                'Conversation retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/v1/conversations/:id
     * Update a conversation
     */
    public updateConversation = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const userId = req.user?.id;

            const conversation =
                await this.conversationService.updateConversation(
                    id,
                    updateData,
                    userId as string
                );

            ResponseUtil.updated(
                res,
                conversation,
                'Conversation updated successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/conversations/:id/participants
     * Add participant to conversation
     */
    public addParticipant = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const { participantId } = req.body;
            const userId = req.user?.id;

            if (!participantId) {
                return ResponseUtil.validationError(
                    res,
                    'Participant ID is required'
                );
            }

            const conversation = await this.conversationService.addParticipant(
                id,
                participantId,
                userId as string
            );

            ResponseUtil.success(
                res,
                conversation,
                'Participant added successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/conversations/:id/participants/:participantId
     * Remove participant from conversation
     */
    public removeParticipant = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id, participantId } = req.params;
            const userId = req.user?.id;

            const conversation =
                await this.conversationService.removeParticipant(
                    id,
                    participantId,
                    userId as string
                );

            ResponseUtil.success(
                res,
                conversation,
                'Participant removed successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/conversations/:id/pin
     * Pin message in conversation
     */
    public pinMessage = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const { messageId } = req.body;
            const userId = req.user?.id;

            if (!messageId) {
                return ResponseUtil.validationError(
                    res,
                    'Message ID is required'
                );
            }

            const conversation = await this.conversationService.pinMessage(
                id,
                messageId,
                userId as string
            );

            ResponseUtil.success(
                res,
                conversation,
                'Message pinned successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/conversations/:id/pin/:messageId
     * Unpin message in conversation
     */
    public unpinMessage = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id, messageId } = req.params;
            const userId = req.user?.id;

            const conversation = await this.conversationService.unpinMessage(
                id,
                messageId,
                userId as string
            );

            ResponseUtil.success(
                res,
                conversation,
                'Message unpinned successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/conversations/:id
     * Delete conversation for user (soft delete)
     */
    public deleteConversation = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            await this.conversationService.deleteConversationForUser(
                id,
                userId as string
            );

            ResponseUtil.deleted(res, 'Conversation deleted successfully');
        } catch (error) {
            next(error);
        }
    };
}
