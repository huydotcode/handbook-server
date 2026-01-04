import Follows, { IFollowsModel } from '../models/follow.model';
import { BaseRepository } from './base.repository';
import { POPULATE_USER } from '../common/utils/populate';

/**
 * Repository for follower/following relationships.
 */
export class FollowRepository extends BaseRepository<IFollowsModel> {
    constructor() {
        super(Follows);
    }

    /**
     * Find followings for a user with populate.
     */
    async findFollowings(userId: string) {
        return await this.model
            .find({ follower: userId })
            .populate('follower', POPULATE_USER)
            .populate('following', POPULATE_USER)
            .lean();
    }

    /**
     * Find followers for a user with populate.
     */
    async findFollowers(userId: string) {
        return await this.model
            .find({ following: userId })
            .populate('follower', POPULATE_USER)
            .populate('following', POPULATE_USER)
            .lean();
    }

    /**
     * Find following IDs for a user.
     */
    async findFollowingIds(userId: string): Promise<string[]> {
        const followings = await this.model
            .find({ follower: userId })
            .select('following')
            .lean();
        return followings.map((f) => f.following.toString());
    }
}
