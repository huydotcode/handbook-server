import { Schema, model, models, Types, Document } from 'mongoose';

// Note: EGroupUserRole is now exported from groupMember.model.ts
// Kept here for backward compatibility
export enum EGroupUserRole {
    MEMBER = 'MEMBER',
    ADMIN = 'ADMIN',
}

export interface IGroupModel extends Document {
    _id: string;
    name: string;
    description: string;
    avatar: Types.ObjectId;
    creator: Types.ObjectId;
    coverPhoto: string;
    type: string;
    introduction: string;
    lastActivity: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IGroupInput {
    name: string;
    description: string;
    avatar: Types.ObjectId;
    creator: Types.ObjectId;
    coverPhoto: string;
    type: string;
    introduction: string;
}

export interface IGroupOutput extends IGroupInput {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

const GroupSchema = new Schema<IGroupModel>(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        avatar: {
            type: Schema.Types.ObjectId,
            ref: 'Media',
            required: true,
        },
        creator: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        type: {
            type: String,
            default: 'public',
        },
        coverPhoto: {
            type: String,
            default: '/assets/img/cover-page.jpg',
        },
        introduction: {
            type: String,
            default: '',
        },
        lastActivity: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
GroupSchema.index({ name: 'text' });
GroupSchema.index({ name: 1 });
GroupSchema.index({ creator: 1 });

const Group = models.Group || model<IGroupModel>('Group', GroupSchema);
export default Group;
