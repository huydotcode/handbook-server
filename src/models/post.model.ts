import mongoose, { Document, Schema, Types, model, models } from 'mongoose';

export interface IPostModel extends Document {
    _id: string;
    option: string;
    text: string;
    media: Types.ObjectId[];
    author: Types.ObjectId;
    group: Types.ObjectId;

    commentsCount: number;
    lovesCount: number;
    sharesCount: number;

    tags: string[];
    type: EPostType;
    status: EPostStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPostWithInteraction extends IPostModel {
    userHasLoved: boolean;
    userHasShared: boolean;
    userHasSaved: boolean;
}

export interface IPostInput {
    option: string;
    text: string;
    media: Types.ObjectId[];
    author: Types.ObjectId;
    group: Types.ObjectId;
}

export interface IPostOutput extends IPostInput {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum EPostType {
    DEFAULT = 'default',
    GROUP = 'group',
}

export enum EPostOption {
    PUBLIC = 'public',
    PRIVATE = 'private',
    FRIEND = 'friend',
}

export enum EPostStatus {
    ACTIVE = 'active',
    PENDING = 'pending',
    REJECTED = 'rejected',
}

const PostSchema = new Schema<IPostModel>(
    {
        option: {
            type: String,
            default: EPostOption.PUBLIC,
            enum: Object.values(EPostOption),
        },
        text: {
            type: String,
            default: '',
        },
        media: {
            type: [Types.ObjectId],
            default: [],
            ref: 'Media',
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            default: null,
        },
        lovesCount: {
            type: Number,
            default: 0,
        },
        sharesCount: {
            type: Number,
            default: 0,
        },
        commentsCount: {
            type: Number,
            default: 0,
        },
        tags: {
            type: [String],
            default: [],
        },
        type: {
            type: String,
            default: EPostType.DEFAULT,
            enum: Object.values(EPostType),
        },
        status: {
            type: String,
            default: EPostStatus.ACTIVE,
            enum: Object.values(EPostStatus),
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
PostSchema.index({ group: 1 });
PostSchema.index({ author: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ text: 'text' });
PostSchema.index({ tags: 'text' });

const Post = models.Post || model<IPostModel>('Post', PostSchema);

export default Post;
