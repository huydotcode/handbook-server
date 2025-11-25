import { Types } from 'mongoose';
import { NotFoundError } from '../common/errors';
import { PaginationResult } from '../common/types/base';
import { IMediaModel } from '../models/media.model';
import { MediaRepository } from '../repositories/media.repository';
import { PostRepository } from '../repositories/post.repository';
import { BaseService } from './base.service';

export class MediaService extends BaseService<IMediaModel> {
    private mediaRepository: MediaRepository;
    private postRepository: PostRepository;

    constructor() {
        const repository = new MediaRepository();
        super(repository);
        this.mediaRepository = repository;
        this.postRepository = new PostRepository();
    }

    /**
     * Create a new media
     * @param data - Media data
     * @param userId - User ID performing the action
     * @returns Created media
     */
    async createMedia(data: any, userId: string) {
        // Validate required fields
        this.validateRequiredFields(data, ['publicId', 'url', 'creator']);

        // Set creator from userId
        data.creator = userId;

        return await this.create(data, userId);
    }

    /**
     * Get media by creator
     * @param creatorId - Creator ID
     * @returns Array of media
     */
    async getMediaByCreator(creatorId: string) {
        this.validateId(creatorId);
        return await this.mediaRepository.findManyWithSort(
            { creator: creatorId },
            { createdAt: -1 }
        );
    }

    /**
     * Get media by type
     * @param type - Media type
     * @returns Array of media
     */
    async getMediaByType(type: string) {
        return await this.mediaRepository.findManyWithSort(
            { type },
            { createdAt: -1 }
        );
    }

    /**
     * Get media by ID
     * @param id - Media ID
     * @returns Media
     */
    async getMediaById(id: string) {
        this.validateId(id, 'Media ID');
        return await this.getByIdOrThrow(id);
    }

    /**
     * Get profile pictures (media from user's posts)
     * @param userId - User ID
     * @param page - Page number
     * @param pageSize - Page size
     * @returns Paginated media
     */
    async getProfilePictures(
        userId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IMediaModel>> {
        this.validateId(userId, 'User ID');
        this.validatePagination(page, pageSize);

        // Get all posts by user with media
        const posts = await this.postRepository.findMany({
            author: new Types.ObjectId(userId),
            media: { $exists: true, $ne: [] },
        });

        // Extract all media IDs from posts
        const mediaIds = posts.flatMap((post) => {
            return (post.media || []).map((m) =>
                typeof m === 'string' ? m : m.toString()
            );
        });

        if (mediaIds.length === 0) {
            return {
                data: [],
                pagination: {
                    page,
                    pageSize,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false,
                },
            };
        }

        // Get unique media IDs
        const uniqueMediaIds = [...new Set(mediaIds)];

        // Get media with type 'image' only
        const allMedia = await this.mediaRepository.findMany({
            _id: { $in: uniqueMediaIds.map((id) => new Types.ObjectId(id)) },
            type: 'image',
        });

        // Sort by creation date (newest first)
        const sortedMedia = allMedia.sort((a, b) => {
            return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
        });

        // Paginate manually
        const skip = (page - 1) * pageSize;
        const paginatedMedia = sortedMedia.slice(skip, skip + pageSize);
        const total = sortedMedia.length;
        const totalPages = Math.ceil(total / pageSize) || 1;

        return {
            data: paginatedMedia,
            pagination: {
                page,
                pageSize,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }

    /**
     * Delete media by URL
     * @param url - Media URL
     * @returns True if deleted
     */
    async deleteMediaByUrl(url: string): Promise<boolean> {
        const media = await this.mediaRepository.findOne({ url });
        if (!media) {
            return false;
        }

        const mediaId = media._id.toString();
        const creatorId =
            typeof media.creator === 'string'
                ? media.creator
                : media.creator.toString();
        return await this.delete(mediaId, creatorId);
    }

    /**
     * Get all medias with pagination (admin only)
     * @param page - Page number
     * @param pageSize - Page size
     * @returns Paginated medias
     */
    async getAllMedias(
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IMediaModel>> {
        this.validatePagination(page, pageSize);
        const { currentPage, currentPageSize } = this.normalizePagination(
            page,
            pageSize
        );

        return await this.mediaRepository.findAllPaginated(
            currentPage,
            currentPageSize
        );
    }

    /**
     * Delete media by ID (admin only)
     * @param mediaId - Media ID
     * @param userId - User ID performing the action
     * @returns True if deleted
     */
    async deleteMedia(mediaId: string, userId: string): Promise<boolean> {
        this.validateId(mediaId, 'Media ID');
        this.validateId(userId, 'User ID');

        const deleted = await this.delete(mediaId, userId);
        if (!deleted) {
            throw new NotFoundError(`Media not found with id: ${mediaId}`);
        }

        return true;
    }
}
