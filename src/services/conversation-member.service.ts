import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError } from '../common/errors/app.error';
import { IConversationMemberModel } from '../models/conversation-member.model';
import { ConversationMemberRepository } from '../repositories/conversation-member.repository';
import { BaseService } from './base.service';
import { Types } from 'mongoose';

export class ConversationMemberService extends BaseService<IConversationMemberModel> {
    private conversationMemberRepository: ConversationMemberRepository;

    constructor() {
        const repository = new ConversationMemberRepository();
        super(repository);
        this.conversationMemberRepository = repository;
    }

    async addMember(
        conversationId: string,
        userId: string,
        role: 'admin' | 'member'
    ) {
        this.validateId(conversationId, 'Conversation ID');
        this.validateId(userId, 'User ID');
        if (!['admin', 'member'].includes(role)) {
            throw new AppError('Invalid role', HTTP_STATUS.BAD_REQUEST);
        }

        // Check if member already exists
        const existingMember = await this.conversationMemberRepository.findOne({
            conversation: conversationId,
            user: userId,
        });

        if (existingMember) {
            return existingMember;
        }

        return await this.create(
            {
                conversation: new Types.ObjectId(conversationId),
                user: new Types.ObjectId(userId),
                role,
            } as any,
            userId
        );
    }

    async removeMember(conversationId: string, userId: string) {
        this.validateId(conversationId, 'Conversation ID');
        this.validateId(userId, 'User ID');
        const deleted = await this.conversationMemberRepository.deleteMany({
            conversation: conversationId,
            user: userId,
        });
        return deleted;
    }

    async setRole(
        conversationId: string,
        userId: string,
        role: 'admin' | 'member'
    ) {
        this.validateId(conversationId, 'Conversation ID');
        this.validateId(userId, 'User ID');
        if (!['admin', 'member'].includes(role)) {
            throw new AppError('Invalid role', HTTP_STATUS.BAD_REQUEST);
        }
        const updated = await this.conversationMemberRepository.updateRole(
            conversationId,
            userId,
            role
        );
        return updated;
    }

    async listMembers(conversationId: string) {
        this.validateId(conversationId, 'Conversation ID');
        return await this.conversationMemberRepository.findByConversation(
            conversationId
        );
    }

    async isMember(conversationId: string, userId: string): Promise<boolean> {
        this.validateId(conversationId, 'Conversation ID');
        this.validateId(userId, 'User ID');
        return await this.conversationMemberRepository.isMember(
            conversationId,
            userId
        );
    }
}
