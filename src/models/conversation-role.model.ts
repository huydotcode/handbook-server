import { Document, model, models, Schema, Types } from 'mongoose';

export interface IConversationRoleModel extends Document {
    _id: string;
    conversationId: Types.ObjectId;
    userIds: Types.ObjectId[];
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IConversationRoleInput {
    conversationId: Types.ObjectId;
    userIds: Types.ObjectId[];
    role: string;
}

export interface IConversationRoleOutput extends IConversationRoleInput {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationRoleSchema = new Schema<IConversationRoleModel>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },
        userIds: {
            type: [Schema.Types.ObjectId],
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['admin', 'member'],
        },
    },
    {
        timestamps: true,
    }
);

const ConversationRole =
    models?.ConversationRole ||
    model<IConversationRoleModel>('ConversationRole', ConversationRoleSchema);

export default ConversationRole;
