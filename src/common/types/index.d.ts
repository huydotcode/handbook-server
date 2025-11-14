export type User = {
    comparePassword(password: string): unknown;
    id: string;
    name: string;
    image: string;
    email: string;
    password: string;
};

export type IComment = {
    _id: string;
    text: string;
    author: IUser;
    replyComment: IComment;
    loves: IUser[];
    post: IPost;
    isDeleted: boolean;
    hasReplies: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type ILocation = {
    _id: string;
    name: string;
    slug: string;
    type: string;
    nameWithType: string;
    code: string;
};

export type IMedia = {
    _id: string;
    publicId: string;
    width: number;
    height: number;
    resourceType: string;
    type: string;
    url: string;
    creator: IUser;
    createdAt: Date;
    updatedAt: Date;
};

export type IGroup = {
    _id: string;
    name: string;
    description: string;
    avatar: IMedia;
    members: IMemberGroup[];
    creator: IUser;
    coverPhoto: string;
    type: string;
    introduction: string;
    lastActivity: Date;
    createdAt: Date;
    updatedAt: Date;
};

export type IProfile = {
    _id: string;
    user: IUser;
    coverPhoto: string;
    bio: string;
    work: string;
    education: string;
    location: string;
    dateOfBirth: Date;

    createdAt: Date;
    updatedAt: Date;
};
export type IMessage = {
    _id: string;
    text: string;
    media: IMedia[];
    sender: IUser;
    conversation: IConversation;
    isRead: boolean;
    isPin: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type INotification = {
    _id: string;

    sender: IUser;
    receiver: IUser;
    message: string;
    isRead: boolean;
    type: string;

    createdAt: Date;
    updatedAt: Date;
};

export type IPost = {
    _id: string;
    option: string;
    text: string;
    media: IMedia[];
    author: IUser;
    loves: IUser[];
    shares: IUser[];
    group: IGroup | null;
    comments_count: number;
    createdAt: Date;
    updatedAt: Date;
    type: 'default' | 'group';
    status: 'active' | 'pending' | 'rejected';
    tags: string[];
    userHasLoved?: boolean;
    userHasShared?: boolean;
    userHasSaved?: boolean;
};

export type IUser = {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar: string;
    role: string;
    givenName: string;
    familyName: string;
    locale: string;

    friends: IUser[];
    groups: IGroup[];
    followersCount: number;

    isOnline: boolean;
    isBlocked: boolean;
    isVerified: boolean;

    lastAccessed: Date;
    createdAt: Date;
    updatedAt: Date;
};

export type IFollows = {
    _id: string;
    follower: IUser;
    following: IUser;
    createdAt: Date;
    updatedAt: Date;
};

export type IMemberGroup = {
    _id: string;
    user: IUser;
    role: string;
    joinedAt: Date;
};

export type IConversation = {
    _id: string;
    title: string;
    creator: IUser;
    participants: IUser[];
    lastMessage: IMessage;
    group?: IGroup;
    type: string;
    status: string;
    avatar: IMedia;
    pinnedMessages: IMessage[];
    isDeletedBy: string[];
    createdAt: Date;
    updatedAt: Date;
};

export type IConversationRole = {
    _id: string;
    conversationId: string;
    userId: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
};

export type ICategory = {
    _id: string;
    name: string;
    description: string;
    slug: string;
    icon: string;
    createdAt: Date;
    updatedAt: Date;
};

export type IItem = {
    _id: string;
    name: string;
    seller: IUser;
    description: string;
    price: number;
    images: IMedia[];
    location: ILocation;
    category: ICategory;
    slug: string;
    status: string;
    attributes: {
        name: string;
        value: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
};
