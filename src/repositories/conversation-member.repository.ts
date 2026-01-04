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
            .populate('user')
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
}
