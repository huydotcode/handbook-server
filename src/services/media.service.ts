import { IMediaModel } from '../models/media.model';
import { BaseService } from './base.service';
import { MediaRepository } from '../repositories/media.repository';

export class MediaService extends BaseService<IMediaModel> {
    private mediaRepository: MediaRepository;

    constructor() {
        const repository = new MediaRepository();
        super(repository);
        this.mediaRepository = repository;
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
}
