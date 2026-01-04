import { Document, Schema, Types, model, models } from 'mongoose';

export type TConversationMemberRole = 'admin' | 'member';

export enum EConversationMemberRole {
    ADMIN = 'admin',
    MEMBER = 'member',
}

export interface IConversationMemberModel extends Document {
    _id: string;
    conversation: Types.ObjectId;
    user: Types.ObjectId;
    role: TConversationMemberRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface IConversationMemberInput {
    conversation: Types.ObjectId;
    user: Types.ObjectId;
    role: TConversationMemberRole;
}

export interface IConversationMemberOutput extends IConversationMemberInput {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationMemberSchema = new Schema<IConversationMemberModel>(
    {
        conversation: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: Object.values(EConversationMemberRole),
            default: EConversationMemberRole.MEMBER,
        },
    },
    {
        timestamps: true,
    }
);

// Unique constraint to prevent duplicate membership per conversation/user
ConversationMemberSchema.index(
    { conversation: 1, user: 1 },
    { unique: true, name: 'unique_conversation_member' }
);
ConversationMemberSchema.index({ conversation: 1 });
ConversationMemberSchema.index({ user: 1 });
ConversationMemberSchema.index({ role: 1 });

const ConversationMember =
    models?.ConversationMember ||
    model<IConversationMemberModel>(
        'ConversationMember',
        ConversationMemberSchema
    );

export default ConversationMember;
