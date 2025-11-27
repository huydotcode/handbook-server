import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../common/constants';
import { AppError } from '../common/errors';
import {
    getAuthenticatedUserId,
    getPaginationParams,
    validateRequiredBodyField,
    validateRequiredParam,
} from '../common/utils/controller.helper';
import { ResponseUtil } from '../common/utils/response';
import { MediaService } from '../services/media.service';
import { ProfileService } from '../services/profile.service';
import { UserService } from '../services/user.service';

/**
 * Controller for user-related HTTP handlers.
 */
export class UserController {
    private userService: UserService;
    private profileService: ProfileService;
    private mediaService: MediaService;

    constructor() {
        this.userService = new UserService();
        this.profileService = new ProfileService();
        this.mediaService = new MediaService();
    }

    /**
     * GET /api/v1/users
     * Fetch users with pagination metadata.
     */
    public getUsers = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { page, pageSize } = getPaginationParams(req, 10);

            const result = await this.userService.getUsersWithPagination({
                page,
                pageSize,
            });

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Users retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/users/:id
     * Get user by ID.
     */
    public getUserById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.params.id;
            validateRequiredParam(userId, 'User ID');

            const user = await this.userService.getByIdOrThrow(userId);

            ResponseUtil.success(res, user, 'User retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/users/:id/friends
     * Retrieve a user's friends list.
     */
    public getFriends = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.params.id;
            validateRequiredParam(userId, 'User ID');

            const friends = await this.userService.getUserFriends(userId);

            ResponseUtil.success(
                res,
                friends,
                'Friends retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/users/:id/unfriend
     * Unfriend a user.
     */
    public unfriendUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const friendId = req.params.id;
            validateRequiredParam(friendId, 'Friend ID');

            await this.userService.unfriendUser(userId, friendId);

            ResponseUtil.success(
                res,
                { success: true },
                'User unfriended successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/users/:id/profile
     * Get user profile (combined user and profile data).
     */
    public getUserProfile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.params.id;
            validateRequiredParam(userId, 'User ID');

            const profile = await this.profileService.getUserProfile(userId);

            ResponseUtil.success(
                res,
                profile,
                'User profile retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/v1/users/:id/bio
     * Update user bio.
     */
    public updateBio = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.params.id;
            validateRequiredParam(userId, 'User ID');
            const currentUserId = getAuthenticatedUserId(req);

            // Verify user is updating their own profile
            if (userId !== currentUserId) {
                throw new AppError(
                    'You are not authorized to update this profile',
                    HTTP_STATUS.FORBIDDEN
                );
            }

            const { bio } = req.body;
            const profile = await this.profileService.updateBio(userId, bio);

            ResponseUtil.success(res, profile, 'Bio updated successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/users/:id/pictures
     * Get profile pictures (media from user's posts).
     */
    public getProfilePictures = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.params.id;
            validateRequiredParam(userId, 'User ID');
            const { page, pageSize } = getPaginationParams(req, 12);

            const result = await this.mediaService.getProfilePictures(
                userId,
                page,
                pageSize
            );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Profile pictures retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/v1/users/:id/profile
     * Update user profile info (work, education, location, dateOfBirth).
     */
    public updateProfile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.params.id;
            validateRequiredParam(userId, 'User ID');

            const currentUserId = getAuthenticatedUserId(req);

            const { work, education, location, dateOfBirth } = req.body;

            const profile = await this.profileService.getProfileByUserId(
                userId
            );

            if (profile.user.toString() !== currentUserId) {
                throw new AppError(
                    'You are not authorized to update this profile',
                    HTTP_STATUS.FORBIDDEN
                );
            }

            await this.profileService.updateProfileByUserId(userId, {
                work,
                education,
                location,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            });

            ResponseUtil.success(res, profile, 'Profile updated successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/v1/users/:id/avatar
     * Update user avatar.
     */
    public updateAvatar = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.params.id;
            validateRequiredParam(userId, 'User ID');
            const currentUserId = getAuthenticatedUserId(req);

            // Verify user is updating their own profile
            if (userId !== currentUserId) {
                throw new AppError(
                    'You are not authorized to update this profile',
                    HTTP_STATUS.FORBIDDEN
                );
            }

            const { avatar } = req.body;
            validateRequiredBodyField(req.body, 'avatar');

            const user = await this.userService.updateAvatar(
                userId,
                avatar,
                currentUserId
            );

            ResponseUtil.success(res, user, 'Avatar updated successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/v1/users/:id/cover-photo
     * Update user cover photo.
     */
    public updateCoverPhoto = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.params.id;
            validateRequiredParam(userId, 'User ID');
            const currentUserId = getAuthenticatedUserId(req);

            // Verify user is updating their own profile
            if (userId !== currentUserId) {
                throw new AppError(
                    'You are not authorized to update this profile',
                    HTTP_STATUS.FORBIDDEN
                );
            }

            const { coverPhoto } = req.body;
            validateRequiredBodyField(req.body, 'coverPhoto');

            const profile = await this.profileService.updateProfileByUserId(
                userId,
                {
                    coverPhoto,
                }
            );

            ResponseUtil.success(
                res,
                profile,
                'Cover photo updated successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
