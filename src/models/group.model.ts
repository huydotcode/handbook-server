import { Schema, model, models, Types, Document } from 'mongoose';

export enum EGroupUserRole {
    MEMBER = 'MEMBER',
    ADMIN = 'ADMIN',
}

export interface IGroupMember {
    user: Types.ObjectId;
    role: EGroupUserRole;
}

export interface IGroupModel extends Document {
    _id: string;
    name: string;
    description: string;
    avatar: Types.ObjectId;
    members: IGroupMember[];
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
    members: IGroupMember[];
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
        members: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    required: true,
                    ref: 'User',
                },
                role: {
                    type: Schema.Types.String,
                    enum: Object.values(EGroupUserRole),
                    default: EGroupUserRole.MEMBER,
                },
            },
        ],
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
GroupSchema.index({ 'members.user': 1 });

const Group = models.Group || model<IGroupModel>('Group', GroupSchema);
export default Group;
