import { IConversationRoleModel } from '../models/conversation-role.model';
import { BaseService } from './base.service';
import { ConversationRoleRepository } from '../repositories/conversation-role.repository';

export class ConversationRoleService extends BaseService<IConversationRoleModel> {
    private conversationRoleRepository: ConversationRoleRepository;

    constructor() {
        const repository = new ConversationRoleRepository();
        super(repository);
        this.conversationRoleRepository = repository;
    }

    /**
     * Create a new conversation role
     * @param data - Conversation role data
     * @param userId - User ID performing the action
     * @returns Created conversation role
     */
    async createConversationRole(data: any, userId: string) {
        // Validate required fields
        this.validateRequiredFields(data, ['name']);

        return await this.create(data, userId);
    }

    /**
     * Get roles by conversation
     * @param conversationId - Conversation ID
     * @returns Array of roles
     */
    async getRolesByConversation(conversationId: string) {
        this.validateId(conversationId, 'Conversation ID');
        return await this.conversationRoleRepository.findMany({
            conversation: conversationId,
        });
    }

    /**
     * Get role by name
     * @param name - Role name
     * @returns Role or null
     */
    async getRoleByName(name: string) {
        return await this.conversationRoleRepository.findOne({ name });
    }
}
