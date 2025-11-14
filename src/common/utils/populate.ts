export const POPULATE_USER = 'name username avatar friends isVerified';
export const POPULATE_GROUP = {
    path: 'group',
    populate: [
        { path: 'avatar' },
        { path: 'members.user', select: POPULATE_USER },
        { path: 'creator', select: POPULATE_USER },
    ],
};
