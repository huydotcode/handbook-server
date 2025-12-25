import { Document, Schema, Types, model, models } from 'mongoose';

export interface IFriendshipModel extends Document {
    _id: string;
    user1: Types.ObjectId;
    user2: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IFriendshipInput {
    user1: Types.ObjectId;
    user2: Types.ObjectId;
}

export interface IFriendshipOutput extends IFriendshipInput {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

const FriendshipSchema = new Schema<IFriendshipModel>(
    {
        user1: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        user2: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

// Indexes
FriendshipSchema.index(
    { user1: 1, user2: 1 },
    { unique: true, name: 'unique_friendship' }
); // Prevent duplicate friendships
FriendshipSchema.index({ user1: 1 }); // Find friends of user1
FriendshipSchema.index({ user2: 1 }); // Find friends of user2
FriendshipSchema.index({ createdAt: -1 }); // Sort by creation date

const Friendship =
    models.Friendship ||
    model<IFriendshipModel>('Friendship', FriendshipSchema);

export default Friendship;
