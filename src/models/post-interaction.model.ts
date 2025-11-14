import mongoose, { Document, Schema, Types, model, models } from 'mongoose';

export enum EPostInteractionType {
    LOVE = 'love',
    SHARE = 'share',
    COMMENT = 'comment',
    SAVE = 'save',
}

export interface IPostInteractionModel extends Document {
    _id: string;
    user: Types.ObjectId;
    post: Types.ObjectId;
    type: EPostInteractionType;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPostInteractionInput {
    user: Types.ObjectId;
    post: Types.ObjectId;
    type: EPostInteractionType;
}

export interface IPostInteractionOutput extends IPostInteractionInput {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

const PostInteractionSchema = new Schema<IPostInteractionModel>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(EPostInteractionType),
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

PostInteractionSchema.index({ user: 1, post: 1, type: 1 });
PostInteractionSchema.index({ post: 1, type: 1 });
PostInteractionSchema.index({ createdAt: -1 });
PostInteractionSchema.index({ type: 1 });

const PostInteraction =
    models.PostInteraction ||
    model<IPostInteractionModel>('PostInteraction', PostInteractionSchema);

export default PostInteraction;
