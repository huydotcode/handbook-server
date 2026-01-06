import { Request, Response } from 'express';
import { ConversationService, UserService } from '../services';
import { FriendService } from '../services/friend.service';

export class RealtimeController {
    private conversationService: ConversationService;
    private userService: UserService;
    private friendService: FriendService;

    constructor() {
        this.conversationService = new ConversationService();
        this.userService = new UserService();
        this.friendService = new FriendService();
    }

    /**
     * GET /internal/realtime/users/:id/conversations
     * Get conversations by member
     */
    public getUserConversations = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const userId = req.params.id;

            const result =
                await this.conversationService.getConversationsByMember(
                    userId,
                    { page: 1, pageSize: 1000 }
                );
            const conversations = result.data;

            // Return only necessary data for joining rooms
            const simplifiedConversations = conversations.map((c) => ({
                _id: c._id,
            }));
            res.json(simplifiedConversations);
        } catch (error) {
            console.error('Error in getUserConversations:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    /**
     * GET /internal/realtime/users/:id
     * Get user details
     */
    public getUserDetails = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const userId = req.params.id;
            const user = await this.userService.getById(userId);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.json({
                _id: user._id,
                name: user.name,
                avatar: user.avatar,
            });
        } catch (error) {
            console.error('Error in getUserDetails:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    /**
     * PATCH /internal/realtime/users/:id/status
     * Update user online status
     */
    public updateUserStatus = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const userId = req.params.id;
            const { isOnline } = req.body;

            await this.userService.updateUserOnlineStatus(userId, isOnline);

            res.json({ success: true });
        } catch (error) {
            console.error('Error in updateUserStatus:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    /**
     * GET /internal/realtime/users/:id/friends/online
     * Get online friends
     */
    public getOnlineFriends = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const userId = req.params.id;

            const onlineFriends = await this.friendService.getOnlineFriends(
                userId
            );
            res.json(onlineFriends);
        } catch (error) {
            console.error('Error in getOnlineFriends:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    /**
     * POST /internal/realtime/heartbeat/cleanup
     * Cleanup offline users
     */
    public cleanupOfflineUsers = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const timeoutMs = 60 * 1000;
            const threshold = new Date(Date.now() - timeoutMs);

            await this.userService.updateOfflineStatusForStaleUsers(threshold);

            res.json({ success: true, message: 'Cleanup active' });
        } catch (error) {
            console.error('Error in cleanupOfflineUsers:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
}
