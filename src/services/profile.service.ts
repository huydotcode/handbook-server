import { NotFoundError } from '../common/errors/app.error';
import { IProfileModel } from '../models/profile.model';
import { ProfileRepository } from '../repositories/profile.repository';
import { BaseService } from './base.service';
import { UserService } from './user.service';

export class ProfileService extends BaseService<IProfileModel> {
    private profileRepository: ProfileRepository;
    private userService: UserService;

    constructor() {
        const repository = new ProfileRepository();
        super(repository);
        this.profileRepository = repository;
        this.userService = new UserService();
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
    async updateProfileByUserId(userId: string, data: Partial<IProfileModel>) {
        this.validateId(userId);

        // Verify user exists
        await this.userService.getByIdOrThrow(userId);

        // Don't allow changing user
        delete data.user;

        // Try to find existing profile
        let profile = await this.profileRepository.findOne({ user: userId });

        if (!profile) {
            // Create profile if it doesn't exist
            profile = await this.create(
                {
                    user: userId as any,
                    ...data,
                },
                userId
            );
        } else {
            // Update existing profile
            profile = await this.profileRepository.findOneAndUpdate(
                { user: userId },
                data
            );
        }

        if (!profile) {
            throw new NotFoundError(`Profile not found with userId: ${userId}`);
        }

        return profile;
    }

    /**
     * Get or create profile by user ID
     * @param userId - User ID
     * @returns Profile
     */
    async getOrCreateProfileByUserId(userId: string): Promise<IProfileModel> {
        this.validateId(userId);

        // Verify user exists
        await this.userService.getByIdOrThrow(userId);

        let profile = await this.profileRepository.findOne({ user: userId });

        if (!profile) {
            // Create default profile if it doesn't exist
            profile = await this.create(
                {
                    user: userId as any,
                    bio: '',
                    coverPhoto: '',
                    work: '',
                    education: '',
                    location: '',
                    dateOfBirth: undefined,
                },
                userId
            );
        }

        return profile;
    }

    /**
     * Get combined user and profile data
     * @param userId - User ID
     * @returns Combined user and profile data
     */
    async getUserProfile(userId: string) {
        this.validateId(userId, 'User ID');

        const user = await this.userService.getByIdOrThrow(userId);
        const profile = await this.getOrCreateProfileByUserId(userId);

        return {
            _id: profile._id,
            bio: profile.bio,
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                name: user.name,
                avatar: user.avatar,
                role: user.role,
                givenName: user.givenName,
                familyName: user.familyName,
                locale: user.locale,
                followersCount: user.followersCount,
                isOnline: user.isOnline,
                isBlocked: user.isBlocked,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            coverPhoto: profile.coverPhoto,
            work: profile.work,
            education: profile.education,
            location: profile.location,
            dateOfBirth: profile.dateOfBirth,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }

    /**
     * Update bio
     * @param userId - User ID
     * @param bio - Bio text
     * @param currentUserId - Current user ID
     * @returns Updated profile
     */
    async updateBio(userId: string, bio: string): Promise<IProfileModel> {
        this.validateId(userId, 'User ID');

        return await this.updateProfileByUserId(userId, { bio });
    }
}
