import { Document, Schema, Types, model, models } from 'mongoose';

export interface IProfileModel extends Document {
    _id: string;
    user: Types.ObjectId;
    coverPhoto: string;
    bio: string;
    work: string;
    education: string;
    location: string;
    dateOfBirth: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IProfileInput {
    user: Types.ObjectId;
    coverPhoto: string;
    bio: string;
    work: string;
    education: string;
    location: string;
    dateOfBirth: Date;
}

export interface IProfileOutput extends IProfileInput {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProfileSchema = new Schema<IProfileModel>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        coverPhoto: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            default: '',
        },
        work: {
            type: String,
            default: '',
        },
        education: {
            type: String,
            default: '',
        },
        location: {
            type: String,
            default: '',
        },
        dateOfBirth: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

ProfileSchema.index({ user: 1 });

const Profile =
    models.Profile || model<IProfileModel>('Profile', ProfileSchema);
export default Profile;
