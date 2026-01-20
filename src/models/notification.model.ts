import { Document, Schema, Types, model, models } from 'mongoose';

export enum ENotificationType {
    // Friend request notifications
    REQUEST_ADD_FRIEND = 'request-add-friend',
    ACCEPT_FRIEND_REQUEST = 'accept-friend-request',
    REJECT_FRIEND_REQUEST = 'reject-friend-request',

    // Message notifications
    MESSAGE = 'message',

    // Follow notifications
    FOLLOW_USER = 'follow-user',

    // Post interactions notifications
    LIKE_POST = 'like-post',
    COMMENT_POST = 'comment-post',

    // Comment interactions notifications
    LIKE_COMMENT = 'like-comment',
    REPLY_COMMENT = 'reply-comment',

    // New post notifications
    CREATE_POST = 'create-post',
}

export interface INotificationModel extends Document {
    _id: string;
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    extra?: {
        postId?: Types.ObjectId;
        commentId?: Types.ObjectId;
        groupId?: Types.ObjectId;
        messageId?: Types.ObjectId;
        notificationId?: Types.ObjectId;

        [key: string]: any;
    };
    isRead: boolean;
    isDeleted: boolean;
    type: ENotificationType;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface INotificationInput {
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    extra?: {
        postId?: Types.ObjectId;
        commentId?: Types.ObjectId;
        groupId?: Types.ObjectId;
        messageId?: Types.ObjectId;
        notificationId?: Types.ObjectId;
    };
    isRead: boolean;
    isDeleted: boolean;
    type: ENotificationType;
    deletedAt?: Date | null;
}

export interface INotificationOutput extends INotificationInput {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationModel>(
    {
        type: {
            type: String,
            enum: Object.values(ENotificationType),
            required: true,
        },
        sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        extra: {
            postId: {
                type: Schema.Types.ObjectId,
                ref: 'Post',
                required: false,
            },
            commentId: {
                type: Schema.Types.ObjectId,
                ref: 'Comment',
                required: false,
            },
            groupId: {
                type: Schema.Types.ObjectId,
                ref: 'Group',
                required: false,
            },
            messageId: {
                type: Schema.Types.ObjectId,
                ref: 'Message',
                required: false,
            },
            notificationId: {
                type: Schema.Types.ObjectId,
                ref: 'Notification',
                required: false,
            },
        },
        isRead: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

NotificationSchema.index({ sender: 1 }); // Index for notifications by sender
NotificationSchema.index({ receiver: 1 }); // Index for notifications by receiver
NotificationSchema.index({ receiver: 1, isRead: 1 });
NotificationSchema.index({ receiver: 1, createdAt: -1 });
NotificationSchema.index({ sender: 1, type: 1 });

const Notification =
    models.Notification ||
    model<INotificationModel>('Notification', NotificationSchema);

export default Notification;
