import { NextFunction, Request, Response } from 'express';
import Conversation from '../models/conversation.model';
import { POPULATE_USER } from '../utils/populate';
import path from 'path';

class ConversationController {
    public async getConversations(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const user_id = req.query.user_id as string;

            const conversations = await Conversation.find({
                participants: {
                    $elemMatch: { $eq: user_id },
                },
                // isDeletedBy: {
                //     $nin: [user_id],
                // },
            })
                .populate('participants', POPULATE_USER + ' lastAccessed')
                .populate('creator', POPULATE_USER)
                .populate('lastMessage')
                .populate('avatar')
                .populate({
                    path: 'group',
                    populate: [
                        { path: 'avatar' },
                        { path: 'members.user' },
                        { path: 'creator' },
                    ],
                });

            res.status(200).json(conversations);
        } catch (error) {
            next(error);
        }
    }

    public async getConversationById(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const conversation_id = req.params.id;
            if (!conversation_id) {
                res.status(400).json({
                    message: 'Conversation ID is required',
                });

                return;
            }

            const conversation = await Conversation.findOne({
                _id: conversation_id,
            })
                .populate('participants', POPULATE_USER + ' lastAccessed')
                .populate('creator', POPULATE_USER)
                .populate('lastMessage')
                .populate('avatar')
                .populate({
                    path: 'group',
                    populate: [
                        {
                            path: 'avatar',
                        },
                        {
                            path: 'members.user',
                        },
                        {
                            path: 'creator',
                        },
                    ],
                });

            res.status(200).json(conversation);
        } catch (error: any) {
            next(error);
        }
    }
}

export default new ConversationController();
