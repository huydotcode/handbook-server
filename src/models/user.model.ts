import * as bcrypt from 'bcrypt';
import {
    Document,
    Schema,
    Types,
    deleteModel,
    model,
    modelNames,
    models,
} from 'mongoose';

export interface IUserModel extends Document {
    _id: string;
    email: string;
    username: string;
    name: string;
    avatar: string;
    role: EUserRole;
    givenName: string;
    familyName: string;
    locale: string;
    friends: Types.ObjectId[];
    groups: Types.ObjectId[];
    followersCount: number;
    isOnline: boolean;
    isBlocked: boolean;
    isVerified: boolean;
    password: string;
    lastAccessed: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(password: string): Promise<boolean>;
}

export interface IUserInput {
    email: string;
    username: string;
    name: string;
    avatar: string;
    role: EUserRole;
}

export interface IUserOutput extends IUserInput {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum EUserRole {
    ADMIN = 'admin',
    USER = 'user',
}

const UserSchema = new Schema<IUserModel>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        username: {
            type: String,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: Object.values(EUserRole),
            default: EUserRole.USER,
        },
        isOnline: {
            type: Boolean,
            default: false,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        password: String,
        givenName: {
            type: String,
            default: '',
        },
        familyName: {
            type: String,
            default: '',
        },
        locale: {
            type: String,
            default: '',
        },
        friends: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                validate: {
                    validator: function (v: Types.ObjectId[]) {
                        // Check if there are duplicate friends
                        return (
                            v.length ===
                            new Set(
                                v.map((id: Types.ObjectId) => id.toString())
                            ).size
                        );
                    },
                    message: 'Friends array contains duplicate friends',
                },
            },
        ],
        groups: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Group',
                validate: {
                    validator: function (v: Types.ObjectId[]) {
                        // Check if there are duplicate groups
                        return (
                            v.length ===
                            new Set(
                                v.map((id: Types.ObjectId) => id.toString())
                            ).size
                        );
                    },
                    message: 'Groups array contains duplicate groups',
                },
            },
        ],
        followersCount: {
            type: Number,
            default: 0,
        },
        lastAccessed: {
            type: Date,
            default: Date.now(),
        },
    },
    {
        timestamps: true,
    }
);

// Index text with username and name
UserSchema.index({ username: 'text', name: 'text' });

if (modelNames && modelNames().includes('User')) {
    deleteModel('User');
}

UserSchema.methods.comparePassword = async function (password: string) {
    const user = this as IUserModel;
    if (user.password === undefined) {
        return false;
    }
    return bcrypt.compare(password, user.password!);
};

UserSchema.pre('save', async function (next) {
    const user = this as IUserModel;
    if (user.isModified('password')) {
        user.password = user.password;
    }
    next();
});

const User = models.User || model<IUserModel>('User', UserSchema);

export default User;
