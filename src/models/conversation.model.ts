import { Document, Schema, Types, model, models } from 'mongoose';

export enum EConversationType {
    PRIVATE = 'private',
    GROUP = 'group',
}

export interface IConversationModel extends Document {
    _id: string;
    title: string;
    creator: Types.ObjectId;
    group: Types.ObjectId;
    lastMessage: Types.ObjectId;
    avatar: Types.ObjectId;
    type: EConversationType;
    status: string;
    pinnedMessages: Types.ObjectId[];
    isDeletedBy: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    members?: any[];
}

export interface IConversationInput {
    title: string;
    creator: Types.ObjectId;
    type: EConversationType;
    group: Types.ObjectId;
    lastMessage: Types.ObjectId;
    avatar: Types.ObjectId;
}

export interface IConversationOutput extends IConversationInput {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationModel = new Schema<IConversationModel>(
    {
        title: { type: String, default: '' },
        creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
            required: false,
            default: null,
        },
        avatar: {
            type: Schema.Types.ObjectId,
            ref: 'Media',
            required: false,
        },
        type: {
            type: String,
            default: EConversationType.PRIVATE,
            enum: EConversationType,
        },
        group: {
            type: Schema.Types.ObjectId,
            ref: 'Group',
            required: false,
            default: null,
        },
        pinnedMessages: {
            type: [Schema.Types.ObjectId],
            ref: 'Message',
            required: false,
            default: [],
        },
        isDeletedBy: {
            type: [Schema.Types.ObjectId],
            ref: 'User',
            required: false,
            default: [],
        },
        status: { type: String, default: 'active' },
    },
    { timestamps: true }
);

ConversationModel.index({ title: 'text' });
ConversationModel.index({ type: 1 });
ConversationModel.index({ group: 1 });
ConversationModel.index({ lastMessage: 1 });
ConversationModel.index({ avatar: 1 });
ConversationModel.index({ isDeletedBy: 1 });
ConversationModel.index({ status: 1 });

const Conversation =
    models.Conversation ||
    model<IConversationModel>('Conversation', ConversationModel);

export default Conversation;
