import { POPULATE_USER } from '../common/utils';
import ConversationMember, {
    IConversationMemberModel,
} from '../models/conversation-member.model';
import { BaseRepository } from './base.repository';

export class ConversationMemberRepository extends BaseRepository<IConversationMemberModel> {
    constructor() {
        super(ConversationMember);
    }

    async findByConversation(conversationId: string) {
        return await this.model
            .find({ conversation: conversationId })
            .populate('user', POPULATE_USER + ' lastAccessed isOnline')
            .lean();
    }

    async findByUser(userId: string) {
        return await this.model
            .find({ user: userId })
            .populate('conversation')
            .lean();
    }

    async isMember(conversationId: string, userId: string): Promise<boolean> {
        const doc = await this.model
            .findOne({ conversation: conversationId, user: userId })
            .lean();
        return !!doc;
    }

    async updateRole(
        conversationId: string,
        userId: string,
        role: 'admin' | 'member'
    ) {
        return await this.model.findOneAndUpdate(
            { conversation: conversationId, user: userId },
            { role },
            { new: true }
        );
    }

    async findPrivateConversationsByUser(userId: string) {
        return await this.model
            .find({ user: userId })
            .populate({
                path: 'conversation',
                match: { type: 'private' },
                populate: {
                    path: 'lastMessage',
                    select: 'content sender createdAt',
                },
            })
            .lean();
    }

    async findMembersByConversationIds(conversationIds: string[]) {
        return await this.model
            .find({
                conversation: { $in: conversationIds },
            })
            .populate('user', '_id name avatar isOnline')
            .lean();
    }

    async findGroupConversationsByUser(userId: string) {
        return await this.model
            .find({ user: userId })
            .populate({
                path: 'conversation',
                match: { type: 'group' },
                populate: [
                    {
                        path: 'lastMessage',
                        select: 'content sender createdAt',
                    },
                    {
                        path: 'avatar',
                        select: 'url',
                    },
                    {
                        path: 'group',
                        select: 'name avatar',
                        populate: {
                            path: 'avatar',
                            select: 'url',
                        },
                    },
                ],
            })
            .lean();
    }
}
