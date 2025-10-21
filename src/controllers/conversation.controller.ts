import { NextFunction, Request, Response } from 'express';
import Conversation from '../models/conversation.model';
import { IConversation } from '../types';
import { getDecodedTokenFromHeaders } from '../utils/jwt';
import { POPULATE_USER } from '../utils/populate';

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
            })
                .populate(
                    'participants',
                    POPULATE_USER + ' lastAccessed isOnline'
                )
                .populate('creator', POPULATE_USER)
                .populate({
                    path: 'lastMessage',
                    populate: [
                        {
                            path: 'sender',
                            select: POPULATE_USER,
                        },
                        {
                            path: 'readBy.user',
                            select: POPULATE_USER,
                        },
                    ],
                })
                .populate('avatar')
                .populate({
                    path: 'group',
                    populate: [
                        { path: 'avatar' },
                        { path: 'members.user', select: POPULATE_USER },
                        { path: 'creator', select: POPULATE_USER },
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
            const decoded = await getDecodedTokenFromHeaders(req.headers);

            if (!decoded) {
                res.status(401).json({
                    message: 'Unauthorized',
                });

                return;
            }

            if (!conversation_id) {
                res.status(400).json({
                    message: 'Conversation ID is required',
                });

                return;
            }

            const conversation = (await Conversation.findOne({
                _id: conversation_id,
            })
                .populate(
                    'participants',
                    POPULATE_USER + ' lastAccessed isOnline'
                )
                .populate('creator', POPULATE_USER)
                .populate({
                    path: 'lastMessage',
                    populate: [
                        {
                            path: 'sender',
                            select: POPULATE_USER,
                        },
                        {
                            path: 'readBy.user',
                            select: POPULATE_USER,
                        },
                    ],
                })
                .populate('avatar')
                .populate({
                    path: 'group',
                    populate: [
                        { path: 'avatar' },
                        { path: 'members.user', select: POPULATE_USER },
                        { path: 'creator', select: POPULATE_USER },
                    ],
                })) as IConversation;

            if (
                conversation.type === 'private' &&
                !conversation.participants.some(
                    (participant) => participant._id.toString() === decoded.id
                )
            ) {
                res.status(403).json({
                    message:
                        'You do not have permission to access this conversation',
                });

                return;
            }

            res.status(200).json(conversation);
        } catch (error: any) {
            next(error);
        }
    }
}

export default new ConversationController();
