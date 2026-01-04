import { NextFunction, Request, Response } from 'express';
import { ConversationService, ConversationMemberService } from '../services';
import { ResponseUtil } from '../common/utils/response';
import {
    getPaginationParams,
    getAuthenticatedUserId,
    validateRequiredParam,
    validateRequiredBodyField,
} from '../common/utils/controller.helper';

export class ConversationController {
    private conversationService: ConversationService;
    private conversationMemberService: ConversationMemberService;

    constructor() {
        this.conversationService = new ConversationService();
        this.conversationMemberService = new ConversationMemberService();
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
            const userId = getAuthenticatedUserId(req);

            const conversation =
                await this.conversationService.createConversation(
                    conversationData,
                    userId
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
     * GET /api/v1/conversations?user_id=:userId&group_id=:groupId
     * Get conversations by participant or group with pagination
     */
    public getConversations = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const groupId = req.query.group_id as string;
            const { page, pageSize } = getPaginationParams(req, 20);

            if (groupId) {
                // Get conversations by group ID
                const result =
                    await this.conversationService.getConversationsByGroup(
                        groupId,
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
            } else {
                // Get conversations by participant
                const userId =
                    (req.query.user_id as string) ||
                    getAuthenticatedUserId(req);
                validateRequiredParam(userId, 'User ID');

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
            }
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
            const id = req.params.id;
            validateRequiredParam(id, 'Conversation ID');
            const userId = getAuthenticatedUserId(req);

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
            const id = req.params.id;
            validateRequiredParam(id, 'Conversation ID');
            const updateData = req.body;
            const userId = getAuthenticatedUserId(req);

            const conversation =
                await this.conversationService.updateConversation(
                    id,
                    updateData,
                    userId
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
            const id = req.params.id;
            validateRequiredParam(id, 'Conversation ID');
            const { participantId } = req.body;
            validateRequiredBodyField(req.body, 'participantId');
            const userId = getAuthenticatedUserId(req);

            const conversation = await this.conversationService.addParticipant(
                id,
                participantId,
                userId
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
            const id = req.params.id;
            const participantId = req.params.participantId;
            validateRequiredParam(id, 'Conversation ID');
            validateRequiredParam(participantId, 'Participant ID');
            const userId = getAuthenticatedUserId(req);

            const conversation =
                await this.conversationService.removeParticipant(
                    id,
                    participantId,
                    userId
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
            const id = req.params.id;
            validateRequiredParam(id, 'Conversation ID');
            const { messageId } = req.body;
            validateRequiredBodyField(req.body, 'messageId');
            const userId = getAuthenticatedUserId(req);

            const conversation = await this.conversationService.pinMessage(
                id,
                messageId,
                userId
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
            const id = req.params.id;
            const messageId = req.params.messageId;
            validateRequiredParam(id, 'Conversation ID');
            validateRequiredParam(messageId, 'Message ID');
            const userId = getAuthenticatedUserId(req);

            const conversation = await this.conversationService.unpinMessage(
                id,
                messageId,
                userId
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
            const id = req.params.id;
            validateRequiredParam(id, 'Conversation ID');
            const userId = getAuthenticatedUserId(req);

            await this.conversationService.deleteConversationForUser(
                id,
                userId
            );

            ResponseUtil.deleted(res, 'Conversation deleted successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/conversations/private?user_id=:userId&friend_id=:friendId
     * Get or create private conversation between two users
     */
    public getPrivateConversation = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId =
                (req.query.user_id as string) || getAuthenticatedUserId(req);
            const friendId = req.query.friend_id as string;
            validateRequiredParam(userId, 'User ID');
            validateRequiredParam(friendId, 'Friend ID');

            const result =
                await this.conversationService.getPrivateConversation(
                    userId,
                    friendId
                );

            ResponseUtil.success(
                res,
                result,
                result.isNew
                    ? 'Private conversation created successfully'
                    : 'Private conversation retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/conversations/:id/restore
     * Restore conversation (undelete) for user
     */
    public restoreConversation = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const id = req.params.id;
            validateRequiredParam(id, 'Conversation ID');
            const userId = getAuthenticatedUserId(req);

            const conversation =
                await this.conversationService.restoreConversation(id, userId);

            ResponseUtil.success(
                res,
                conversation,
                'Conversation restored successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/conversations/:id/members
     * List members of a conversation
     */
    public listMembers = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const id = req.params.id;
            validateRequiredParam(id, 'Conversation ID');
            const userId = getAuthenticatedUserId(req);

            const isAllowed = await this.conversationMemberService.isMember(
                id,
                userId
            );
            if (!isAllowed) {
                return ResponseUtil.forbidden(
                    res,
                    'You are not a member of this conversation'
                );
            }

            const members = await this.conversationMemberService.listMembers(
                id
            );

            ResponseUtil.success(
                res,
                members,
                'Conversation members retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
