import { Schema, model, models, Types, Document } from 'mongoose';

export enum EGroupUserRole {
    MEMBER = 'MEMBER',
    ADMIN = 'ADMIN',
}

export interface IGroupMemberModel extends Document {
    _id: string;
    group: Types.ObjectId;
    user: Types.ObjectId;
    role: EGroupUserRole;
    joinedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IGroupMemberInput {
    group: Types.ObjectId;
    user: Types.ObjectId;
    role?: EGroupUserRole;
}

export interface IGroupMemberOutput extends IGroupMemberInput {
    _id: string;
    joinedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const GroupMemberSchema = new Schema<IGroupMemberModel>(
    {
        group: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Group',
        },
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        role: {
            type: String,
            enum: Object.values(EGroupUserRole),
            default: EGroupUserRole.MEMBER,
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
GroupMemberSchema.index({ group: 1, user: 1 }, { unique: true }); // One membership per group-user combo
GroupMemberSchema.index({ group: 1 }); // Find all members of a group
GroupMemberSchema.index({ user: 1 }); // Find all groups of a user
GroupMemberSchema.index({ group: 1, role: 1 }); // Find admins of a group

const GroupMember =
    models.GroupMember ||
    model<IGroupMemberModel>('GroupMember', GroupMemberSchema);
export default GroupMember;
