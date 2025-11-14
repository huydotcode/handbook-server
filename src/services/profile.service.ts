import { NotFoundError } from '../common/errors/app.error';
import { IProfileModel } from '../models/profile.model';
import { ProfileRepository } from '../repositories/profile.repository';
import { BaseService } from './base.service';

export class ProfileService extends BaseService<IProfileModel> {
    private profileRepository: ProfileRepository;

    constructor() {
        const repository = new ProfileRepository();
        super(repository);
        this.profileRepository = repository;
    }

    /**
     * Create a new profile
     * @param data - Profile data
     * @param userId - User ID performing the action
     * @returns Created profile
     */
    async createProfile(data: any, userId: string) {
        // Validate required fields
        this.validateRequiredFields(data, ['user']);

        return await this.create(data, userId);
    }

    /**
     * Get profile by user ID
     * @param userId - User ID
     * @returns Profile or null
     */
    async getProfileByUserId(userId: string) {
        this.validateId(userId);
        const profile = await this.profileRepository.findOne({ user: userId });

        if (!profile) {
            throw new NotFoundError(`Profile not found with userId: ${userId}`);
        }

        return profile;
    }

    /**
     * Update profile by user ID
     * @param userId - User ID
     * @param data - Update data
     * @param currentUserId - Current user ID
     * @returns Updated profile
     */
    async updateProfileByUserId(
        userId: string,
        data: any,
        currentUserId: string
    ) {
        this.validateId(userId);

        // Don't allow changing user
        delete data.user;

        const profile = await this.profileRepository.findOneAndUpdate(
            { user: userId },
            data
        );

        if (!profile) {
            throw new NotFoundError(`Profile not found with userId: ${userId}`);
        }

        return profile;
    }
}
