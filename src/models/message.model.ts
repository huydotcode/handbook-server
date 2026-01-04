import { Document, Schema, Types, model, models } from 'mongoose';

export interface IMessageModel extends Document {
    _id: string;
    text: string;
    media: Types.ObjectId[];
    sender: Types.ObjectId;
    conversation: Types.ObjectId;
    isPin: boolean;
    readBy: { user: Types.ObjectId; readAt: Date }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IMessageInput {
    text: string;
    media: Types.ObjectId[];
    sender: Types.ObjectId;
    conversation: Types.ObjectId;
    isPin: boolean;
}

export interface IMessageOutput extends IMessageInput {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessageModel>(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        conversation: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },
        text: {
            type: String,
        },
        media: {
            type: [Schema.Types.ObjectId],
            ref: 'Media',
            default: [],
        },
        isPin: {
            type: Boolean,
            default: false,
        },
        readBy: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
                readAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

MessageSchema.index({ text: 'text' }); // Index for text search
MessageSchema.index({ conversation: 1 }); // Index for messages by conversation
MessageSchema.index({ sender: 1 }); // Index for messages by sender
MessageSchema.index({ createdAt: -1 }); // Index for messages by createdAt
MessageSchema.index({ conversation: 1, createdAt: -1 });

const Message =
    models.Message || model<IMessageModel>('Message', MessageSchema);
export default Message;
