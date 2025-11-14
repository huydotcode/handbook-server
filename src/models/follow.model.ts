import { Document, model, models, Schema, Types } from 'mongoose';

export interface IFollowsModel extends Document {
    _id: string;
    follower: Types.ObjectId;
    following: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IFollowsInput {
    follower: Types.ObjectId;
    following: Types.ObjectId;
}

export interface IFollowsOutput extends IFollowsInput {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

const FollowsSchema = new Schema<IFollowsModel>(
    {
        follower: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        following: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

// Index
FollowsSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow = models.Follow || model<IFollowsModel>('Follow', FollowsSchema);

export default Follow;
