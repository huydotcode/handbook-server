import ConversationRole, {
    IConversationRoleModel,
} from '../models/conversation-role.model';
import { BaseRepository } from './base.repository';

export class ConversationRoleRepository extends BaseRepository<IConversationRoleModel> {
    constructor() {
        super(ConversationRole);
    }
}
