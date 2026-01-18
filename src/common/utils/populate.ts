export const POPULATE_USER = 'name username avatar isVerified';
export const POPULATE_USER_ONLINE =
    'name username avatar isVerified isOnline lastAccessed';
export const POPULATE_GROUP = {
    path: 'group',
    populate: [{ path: 'avatar' }, { path: 'creator', select: POPULATE_USER }],
};
